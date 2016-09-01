/**
 * Created by zhoucheng on 8/30/16.
 */
var redis = require('redis');
var config = require('./config');
var moment = require('miment');
var client = redis.createClient({host: config.redisHost, port: config.redisPort});


var customerData = {
    verifyCode: '123456',
    email: 'a@b.com',
    createdAt: moment().format('YY-MM-DD HH:MM:s'),
    lasActive: moment().format('YY-MM-DD HH:MM:s'),
    alive: true
}

var crawlerData = {
    password: '123456',
    lasActive: moment().format('YY-MM-DD HH:MM:s'),
    email: 'a@b.com',
    createdAt: moment().format('YY-MM-DD HH:MM:s'),
    alive: true,
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