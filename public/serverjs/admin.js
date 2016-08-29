/**
 * Created by zhoucheng on 8/29/16.
 */
var redis = require('redis');
var bluebird = require('bluebird'); // for async
var config = require('./config');
var error = require('./error');
var client = redis.createClient({host: config.redisHost, port: config.redisPort});
// var crawled_data = require('./model').crawled_data;
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

client.on('error', function(error) {
    console.log('error: '+error);
})


function admin() {
    this.login = function(user, pw, callback) {
        client.hgetAsync('admin', user).then(function(res) {
            if(res) {
                var data = JSON.parse(res)
                if(data.password === pw)
                    return callback(null, {status: 1})
                else
                    return callback(null, {status: 0})
            } else {
                return callback(null, {status: 0})
            }
        }).catch(function(err) {return callback(err)})
    }

    this.list = function(key, callback) {
        client.hgetallAsync(key).then(function(res) {
            var result = [];
            for(var key in res) {
                result.push(JSON.parse(res[key]))
            }
            return callback(null, {status:1, data: result})
        }).catch(function(err) {return callback(err)})
    }
}


module.exports = new admin();