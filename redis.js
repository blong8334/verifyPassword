const Promise = require('bluebird');
const redis = require('redis');
Promise.promisifyAll(redis);

const client = redis.createClient();

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

module.exports = client;