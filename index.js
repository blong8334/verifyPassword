const redisClient = require('./redis');
const _ = require('lodash');
const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const config = require('nconf');
config.argv().env();

const {loadPasswords} = require('./importList');

const redisKey = 'commonPasswords';

return main(true);

/**
 * Main function of the program that loads, prompts for and validates a given password.
 * @param load
 * @returns {Promise<void>}
 */
async function main(load) {
    const passwords = config.get('passwords');
    const file = config.get('file');
    const script = config.get('script');

    if (load) await loadPasswords(passwords, file, script);

    rl.question('Enter a password: ', async (password) => {
        let results = await validatePassword(password);
        console.log(_.get(results, 'reason'));
        return main();
    });
}

/**
 * Validates if the user inputted password if valid.
 * @param password
 * @returns {Promise<{valid, reason}>}
 */
async function validatePassword(password) {
    let resultTemplate = (valid, reason) => ({valid, reason});
    if (_.get(password, 'length') < 8) return resultTemplate(false, 'ERROR: Password must be at least 8 characters.');
    if (_.get(password, 'length') > 64) return resultTemplate(false, 'ERROR: Password must be less than 65 characters.');
    if (invalidAscii(password)) return resultTemplate(false, 'ERROR: Invalid character(s).');
    if (await redisClient.hgetAsync(redisKey, password)) return resultTemplate(false, 'ERROR: Password is too common.');
    return resultTemplate(true, 'SUCCESS: Password is valid.');
}

/**
 * Checks if the password contains only valid ascii chars (0-127).
 * @param password
 * @returns {boolean}
 */
function invalidAscii(password) {
    return _.some(password, (char, i) => password.charCodeAt(i) > 127);
}