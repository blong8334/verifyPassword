const redisClient = require('./redis');
const fs = require('fs');
const stream = require('stream');
const Promise = require('bluebird');
const _ = require('lodash');
const path = require('path');
const {spawn} = require('child_process');

const defaultFile = '10-million-password-list-top-1000000.txt';
const redisKey = 'commonPasswords';
let count;

module.exports = {loadPasswords};

/**
 * Imports user-provided password text into redis.
 * @param passWordList
 * @returns {Array|Object|*}
 */
function importPasswords (passWordList) {
    if (!_.get(passWordList, 'length') || typeof passWordList !== 'string') return;
    let passWordArr = passWordList.split('\n');
    let passWordChunks = _.chunk(passWordArr, 500);
    return Promise.each(passWordChunks, addToRedis);
}

/**
 * Imports user-provided file(s) of passwords into redis.
 * @param readStream
 * @returns {Promise<void>}
 */
async function importFile (readStream) {
    let stringCache = '';
    let passwords = [];

    const write = async (object, encoding, cb) => {
        stringCache += object.toString();
        let arr = stringCache.split('\n');
        stringCache = arr.pop();
        if (passwords.push(...arr) < 500) return cb();
        await addToRedis(passwords);
        passwords = [];
        cb();
    };
    const writeStream = new stream.Writable({write});
    readStream.pipe(writeStream);

    return new Promise((res, rej) => {
        let streamHandler = (event, cb) => writeStream.on(event, cb);
        let streamEndHandler = async () => {
            if (stringCache) passwords.push(stringCache);
            await addToRedis(passwords);
            res();
        };
        streamHandler('error', err => rej(err));
        streamHandler('finish', streamEndHandler);
        streamHandler('close', streamEndHandler);
    });
}

/**
 * Receives password text, file or a script to load into redis.
 * @param passwords
 * @param file
 * @param script
 * @returns {Promise<void>}
 */
async function loadPasswords(passwords, file, script) {
    console.log(`Writing common passwords to redis`);
    const start = new Date();
    await redisClient.flushallAsync();
    count = 0;

    if (passwords) await importPasswords(passwords).catch(err => console.error(err));
    if (script) {
        let scriptCommands = script.split(' ');
        let command = scriptCommands.shift();
        let child = spawn(command, scriptCommands);
        child.stdout.setEncoding('utf8');
        await importFile(child.stdout).catch(err => console.error(err));
    }
    if (file || !passwords && !script) {
        let filePath = path.resolve(process.cwd(), file || defaultFile);
        const readStream = fs.createReadStream(filePath);
        await importFile(readStream).catch(err => console.error(err));
    }

    console.log(`It took ${(new Date() - start) / 1000} seconds to write ${count} passwords to redis.`);
}

/**
 * Helper function for adding passwords to redis in bulk.
 * @param commonPasswords
 * @returns {Promise<void>}
 */
async function addToRedis(commonPasswords) {
    let passwordLength = _.get(commonPasswords, 'length');
    if (!passwordLength) return;
    let values = _.reduce(commonPasswords, (arr, password) => {
        arr.push(password);
        arr.push(1);
        return arr;
    }, []);
    await redisClient.hmsetAsync(redisKey, ...values);
    count += passwordLength;
}