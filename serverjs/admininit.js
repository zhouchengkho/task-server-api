/**
 * Created by zhoucheng on 8/30/16.
 */
var redis = require('redis');
var config = require('./config');
var client = redis.createClient({host: config.redisHost, port: config.redisPort});


var customerData = {
    password: '123456',
    lasActive: new Date(),
    alive: 1
}

var crawlerData = {
    password: '123456',
    lasActive: new Date(),
    alive: 1,
    successCount: 0,
    failCount: 0
}
client.hset('admin', config.admin, config.adminPassword)
client.hset('customer', 'yunkai', customerData)
client.hset('admin', 'crawler_1', crawlerData)

console.log('Your admin has been set according to config')
console.log('With initial customer: yunkai '+ JSON.stringify(customerData))
console.log('With initial customer: crawler_1 '+ JSON.stringify(crawlerData))

process.exit()