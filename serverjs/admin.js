/**
 * Created by zhoucheng on 8/29/16.
 */
var redis = require('redis');
var bluebird = require('bluebird'); // for async
var config = require('./config');
var error = require('./error');
var client = redis.createClient({host: config.redisHost, port: config.redisPort});
var moment = require('moment');
// var crawled_data = require('./model').crawled_data;
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

client.on('error', function(error) {
    console.log('error: '+error);
})


function admin() {
    this.login = function(user, pw, callback) {
        client.hgetAsync('admin', user).then(function(password) {
            if(pw === password) {
                return callback(null, 1)
            } else {
                return callback(null, 0)
            }
        }).catch(function(err) {return callback(err)})
    }

    this.list = function(key, callback) {
        client.hgetallAsync(key).then(function(res) {
            var result = [];
            for(var id in res) {
                var data = JSON.parse(res[id])
                if(data.alive === true) {
                    data.id = id;
                    result.push(data)
                }
                // data.id = id;
                // result.push(data)
            }
            return callback(null, {data: result})
        }).catch(function(err) {return callback(err)})
    }

    this.update = function(key, reqBody, callback) {
        var data = reqBody.data;
        var id = data.id;

        client.hsetAsync(key, id, JSON.stringify(data)).catch(function(err){return callback(err)})

        return callback(null, {status: 'success'})
        // client.hgetAsync(key, id).then(function(res) {
        //     if(res) {
        //         // var data = JSON.parse(res)
        //         // data.password = password
        //         var status = 'success'
        //         // if(data.alive === false) {
        //         //     data.alive = true;
        //         //     status = 'user renewed'
        //         // }
        //         client.hset(key, username, JSON.stringify(data))
        //         return callback(null, {status: status})
        //     } else {
        //         return callback(null, {status: error.userNotExist})
        //     }
        //
        // }).catch(function(err) {return callback(err)})
    }

    this.find = function(key, username, callback) {
        client.hgetAsync(key, username).then(function(res) {
            if(res) {
                var data = JSON.parse(res)
                // if(data.alive === 0)
                //     return callback(null, {status: error.userNotExist})
                data.username = username
                return callback(null, data)
            } else {
                return callback(null, {status: error.userNotExist})
            }
        })
    }

    this.add = function(key, reqBody, callback) {
        var data = reqBody.data;
        var id = data.id;
        client.hgetAsync(key, id).then(function(res) {
            if(res) {
                return callback(null, {status: error.userExist})
            } else {
                data.lastActive = moment().format('YYYY-MM-DD HH:mm:s')
                data.createdAt = moment().format('YYYY-MM-DD HH:mm:s')
                data.alive = true;
                if(key === 'client') {
                    data.successCount = 0;
                    data.failCount = 0;
                }
                client.hset(key, id, JSON.stringify(data))
                return callback(null, {status: 'success', data: data})
            }
        }).catch(function(err) {return callback(err)})
    }

    this.delete = function(key, reqBody, callback) {
        var id = reqBody.data.id;
        client.hgetAsync(key, id).then(function(res) {
            if(res) {
                res = JSON.parse(res)
                res.alive = false;
                client.hset(key, id, JSON.stringify(res))
                return callback(null, {status: 'success'})
            } else {
                return callback(null, {status: error.userNotExist})
            }
        }).catch(function(err) {return callback(err)})
    }
}


module.exports = new admin();