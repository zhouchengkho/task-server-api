/**
 * Created by zhoucheng on 8/30/16.
 */
var redis = require('redis');
var config = require('./config');
var client = redis.createClient({host: config.redisHost, port: config.redisPort});

client.hset('admin', config.admin, config.adminPassword)
console.log('Your admin has been set according to config')

process.exit()