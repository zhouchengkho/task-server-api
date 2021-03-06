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

    this.list = function(key, query, callback) {
        client.hgetallAsync(key).then(function(res) {
            var result = [];
            for(var id in res) {
                var data = JSON.parse(res[id])
                data.id = id;
                var valid = true
                if(!data.alive)
                    valid = false

                for(var entry in query) {
                    var toCompare = data[entry]
                    if(typeof toCompare == 'string') {
                        if(!contains(toCompare, query[entry])) {
                            valid = false;
                            break;
                        }
                    } else if(typeof toCompare == 'number') {
                        if(! parseInt(query[entry] === toCompare)) {
                            valid = false;
                            break;
                        }
                    }

                }
                if(valid) {
                    result.push(data)
                }

            }
            return callback(null, {data: result})
        }).catch(function(err) {return callback(err)})
    }

    this.update = function(key, reqBody, callback) {
        var data = reqBody.data;
        var id = data.id;

        client.hsetAsync(key, id, JSON.stringify(data)).catch(function(err){return callback(err)})

        return callback(null, {status: 'success'})
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

    this.change = function(reqBody, callback) {
        console.log(reqBody.username+' '+reqBody.password)
        client.hsetAsync('admin', reqBody.username, reqBody.password).catch(function(err) {return callback(err)})
        return callback(null, {status: 'success'})
    }

    this.init = function(callback) {
        client.hgetallAsync('admin').then(function(res) {
            if(res)
                return callback(new Error(error.adminInited))
            client.hset('admin', config.admin, config.adminPassword)
            return callback(null, {status: 'success with info: \n'+config.admin+' / '+config.adminPassword})
        }).catch(function(err) {return callback(err)})
    }
}


function contains(str, substr) {
    return str.indexOf(substr) >= 0;
}

module.exports = new admin();