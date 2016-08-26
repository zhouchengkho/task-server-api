/**
 * Created by zhoucheng on 8/12/16.
 */
var redis = require('redis');
var bluebird = require('bluebird'); // for async
var uuid = require('uuid');
var test = require('./test');
var config = require('./config');
var error = require('./error');
var client = redis.createClient({host: config.redisHost, port: config.redisPort});
// var crawled_data = require('./model').crawled_data;
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

client.on('error', function(error) {
    console.log('error: '+error);
})


var high = config.high;
var low = config.low;
var handling = config.handling;
var script = config.script;
var scriptKey = config.scriptKey;
var maxTaskCount = config.maxTaskCount;
function task() {
    /**
     * right push for redis list
     * @param prior true for higher priority
     * @param value can be array or single value , can be string or json but always stored as string
     * @param callback
     */
    this.rpush = function(prior, value, callback) {
        var priority =  low; // default low
        if(prior) {
            priority = high;
        }
        if(!value)
            return;
        if(value.constructor == Array) {
            var multi = client.multi();
            for (var i=0; i<value.length; i++) {
                //將一個或多個值value插入到列表key的表尾。
                var result = value[i];
                if((typeof result) == 'object')
                {
                    result = JSON.stringify(result);
                }
                multi.rpushAsync(priority, result).catch(function(err){return callback(err)});
            }
            multi.exec();
        } else {
            var result = value;
            if((typeof result) == 'object')
            {
                result = JSON.stringify(result);
            }
            client.rpushAsync(priority, result).catch(function(err){return callback(err)});
        }
    }

    /**
     *  for test
     */
    this.initialize = function() {
        var high = test.getHighValue();
        for (var i=0; i< high.length; i++) {
            high[i].taskId = uuid.v4();
        }
        var low = test.getLowValue();
        for (var i=0; i< low.length; i++) {
            low[i].taskId = uuid.v4();
        }
        this.rpush(true, high);
        this.rpush(false, low);
    }

    /**
     * New task coming in, should have verify process
     * Maybe verify template & customerData too so when data is used there is no error
     * @param reqBody
     * @param callback
     */
    this.filltask = function(reqBody, callback) {
        var data = reqBody.data;
        var valid = this.verifyDataIntegrity(data);
        if(valid) {
            var priority = reqBody.priority ? reqBody.priority : 'low';
            switch(priority){
                case 'high':
                    this.rpush(true, data);
                    break;
                default: // low
                    this.rpush(false, data);
                    break;
            }
            return callback()
        } else {
            return callback(new Error(error.dataNotValid))
        }
    }
    /**
     * distribute task or script or both
     * @param key should be task, script, both
     * @param data include  count
     * @param callback err, data  keep err null if no error
     */
    this.distribute = function(key, data, callback) {
        // var customerData = data.customerData;
        if(typeof data == 'string')
            data = JSON.parse(data)
        var count = data.taskCount ? data.taskCount : 1;
        var self = this;

        switch (key) {
            case 'task':
                self.getTask(count, function(err, res) {
                    return callback(err, res)
                })
                break;
            case 'script':
                self.getScript(scriptKey, function (err, res) {
                    return callback(err, res)
                })
                break;
            case 'both':
                self.getScript(scriptKey, function (scriptErr, scriptRes) {
                    if(scriptErr) return callback(scriptErr)
                    self.getTask(count, function(taskErr, taskRes) {
                        var res = {
                            taskRes: taskRes,
                            scriptRes: scriptRes
                        }
                        return callback(taskErr, res)
                    })
                })
                break;
            default:
                return callback(new Error(error.unknownkey))
                break;
        }
    }

    this.getTask = function(count, callback) {
        if(count > maxTaskCount) {
            return callback(new Error(error.countToBig))
        }
        var result = [];

        client.lrangeAsync(high, 0, -1).then(function (highList) { // get task from high priority
            var highLen = highList.length ?  highList.length : 0;
            if(highLen >= 1) {
                // var result = JSON.parse(list[0]);
                var i = 0;
                while(i < highLen && count > 0 ) {
                    var res = JSON.parse(highList[i])
                    var data = {};
                    data.template = res.template;
                    data.taskId = res.taskId;
                    result.push(data)
                    client.hset(handling, res.taskId, highList[i]);
                    client.lpop(high);
                    i++; count--;
                }
            }
            return count;
        }).then(function(count) {
            if(count > 0) {
                client.lrangeAsync(low, 0, -1).then(function(lowList) {
                    var lowLen = lowList.length ? lowList.length : 0;
                    if(lowLen >= 1) { // get task from high priority
                        var i = 0;
                        while(i < lowLen && count > 0 ) {
                            var res = JSON.parse(lowList[i])
                            var data = {};
                            data.template = res.template;
                            data.taskId = res.taskId;
                            result.push(data)
                            client.hset(handling, res.taskId, lowList[i]);
                            client.lpop(low);
                            i++; count--;
                        }
                    }
                    return callback(null ,result)
                }).catch(function(err){ return callback(err)})
            } else {
                return callback(null, result)
            }
        }).catch(function(err){return callback(err)})
    }
    
    this.getScript = function(key, callback) {
        client.hgetallAsync(script).then(function (res) {
            return res[key];
        }).then(function(resScript){
            if(resScript)
                return callback(null, resScript)
            return callback(new Error(error.emptyScript))
        }).catch(function(err){return callback(err)})
    }

    /**
     * receive report from user, if success, store data as result_customerId
     * else put task back to waiting queue with low priority
     * @param reqBody
     * @param callback
     * @returns {*}
     */
    this.report = function(reqBody, callback) {
        var self = this;
        if(typeof reqBody == 'string')
            reqBody = JSON.parse(reqBody)
        var status = reqBody.status;
        var data = reqBody.data;
        switch(status) {
            case 'success':
                var key;
                var field;
                var result;
                if(data.constructor == Array) {
                    // var fieldAndResultArray = []
                    data.forEach(function(entry) {
                        client.hgetAsync(handling, entry.taskId).then(JSON.parse).then(function(res) {
                            if(res) {
                                field = res.customerData.uid;
                                result = entry.result;
                                key = 'result_'+res.customerData.customerId;
                                client.hdel(handling, entry.taskId);
                                client.hset(key, field, result)
                            }
                        }).catch(function(err) {return callback(err)})
                    })
                } else {
                    client.hgetAsync(handling, data.taskId).then(JSON.parse).then(function(res) {
                        if(res) {
                            key = 'result_'+res.customerData.customerId;
                            field = res.customerData.uid;
                            result = data.result;
                            if((typeof  result) == 'object')
                                result = JSON.stringify(result);
                            client.hdel(handling, data.taskId);
                            client.hset(key, field, result);
                        }
                    }).catch(function(err) {return callback(err)})
                }
                break;
            default: // fail
                if(data.constructor == Array) {
                    data.forEach(function(entry) {
                        client.hgetAsync(handling, entry.taskId).then(function(res) {
                            if (res) {
                                var taskId = entry.taskId;
                                self.rpush(false, res);
                                client.hdel(handling, taskId);
                            }
                        }).catch(function(err) {return callback(err)})
                    })
                }
                else {
                    client.hgetAsync(handling, data.taskId).then(function(result) {
                        if (result) {
                            self.rpush(false, result);
                            client.hdel(handling, data.taskId);
                        }
                    }).catch(function(err){return callback(err)})
                }
                break;
        }
        callback()
    }

    /**
     * get result for customer
     * @param data can contain a uidSet array for the result needed, if not provided then return all
     * @param callback
     */
    this.getResult = function(data, callback) {
        var self = this;
        if(typeof data == 'string')
            data = JSON.parse(data)
        self.verifyCustomer(data.customerId, data.verifyCode, function(valid) {
            if(!valid)
                return callback(new Error(error.verifyFail))
            var set = data.uidSet;
            if(set) {
                var result = {};
                client.hgetallAsync('result_'+data.customerId).then(function(res) {
                    for(var i = 0;i<set.length;i++) {
                        result[set[i]] = res[set[i]]
                    }
                    return callback(null, result)
                }).catch(function(err){return callback(err)})

            } else {
                client.hgetallAsync('result_'+data.customerId).then(function(res){
                    return callback(null, res)
                }).catch(function(err){return callback(err)})
            }

        })
    }

    /**
     * get queue
     * @param query include type & count
     * @param callback
     */
    this.getQueue = function(query, callback) {
        var type = query.type ? query.type : '';
        var count = query.count ? query.count : 100;
        switch (type) {
            case 'high':
                client.lrangeAsync(high, 0, count - 1).then(function(res) {
                    for(var i = 0; i<res.length;i++) {
                        res[i] = JSON.parse(res[i])
                    }
                    return callback(null, {highRes: res})
                }).catch(function(err){return callback(err)})
                break;
            case 'low':
                client.lrangeAsync(low, 0, count - 1).then(function(res) {
                    for(var i = 0; i<res.length;i++) {
                        res[i] = JSON.parse(res[i])
                    }
                    return callback(null, {lowRes: res})
                }).catch(function(err){return callback(err)})
                break;
            case 'handling':
                client.hgetallAsync(handling).then(function(res) {
                    var result = [];
                    for(var key in res) {
                        if(count <= 0)
                            return callback(null, {handlingRes: result})
                        result.push(JSON.parse(res[key]))
                        count--;
                    }
                    return callback(null, {handlingRes: result})
                }).catch(function(err) {return callback(err)})
                break;
            default:
                client.lrangeAsync(high, 0, count - 1).then(function(res) {
                    for(var i = 0; i<res.length;i++) {
                        res[i] = JSON.parse(res[i])
                    }
                    return {highRes: res}
                }).then(function(res) {
                    return client.lrangeAsync(low, 0, count - 1).then(function(lowRes) {
                        for(var i = 0; i<lowRes.length;i++) {
                            lowRes[i] = JSON.parse(lowRes[i])
                        }
                        res.lowRes = lowRes;
                        return res;
                    }).then(function(res) {
                        return client.hgetallAsync(handling).then(function(handlingRes) {
                            var result = [];
                            for(var key in handlingRes) {
                                if(count <= 0) {
                                    res.handlingRes = result;
                                    return res;
                                }
                                result.push(JSON.parse(handlingRes[key]))
                                count--;
                            }
                            res.handlingRes = handlingRes;
                            return res;
                        })
                    })
                }).then(function(res){
                    return callback(null, res)
                }).catch(function(err){return callback(err)})
                break;
        }


    }
    /**
     * verify customer
     * @param customerId
     * @param verifyCode
     * @param callback valid(true or false)
     */
    this.verifyCustomer = function(customerId, verifyCode, callback) {
        callback(true)
    }

    this.verifyDataIntegrity = function(data) {
        if(data.constructor == Array) {
            for(var i = 0; i<data.length;i++) {
                if(data[i].customerData || data[i].template) {
                    if(!data[i].customerData.customerId || !data[i].customerData.uid || !data[i].template.templateId || !data[i].template.content)
                        return false;
                } else {
                    return false;
                }
            }
        } else {
            if(data.customerData || data.template) {
                if(!data.customerData.customerId || !data.customerData.uid || !data.template.templateId || !data.template.content)
                    return false;
            } else {
                return false;
            }
        }
        return true
    }
}


module.exports = new task();