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
var maxTaskCount = config.maxTaskCount;
var defaultTaskCount = config.defaultTaskCount;
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
        var reqBody = test.getHighValue();
        var data = reqBody.data;
        if(data.constructor == Array) {
            for(var i = 0; i< data.length; i++) {
                data[i].taskId = uuid.v4()
                data[i].customerData = reqBody.customerData;
                data[i].template = reqBody.template;
            }
        } else {
            data.taskId = uuid.v4()
            data.customerData = reqBody.customerData;
            data.template = reqBody.template;
        }
        var priority = reqBody.priority ? reqBody.priority : 'low';
        switch(priority){
            case 'high':
                this.rpush(true, data);
                break;
            default: // low
                this.rpush(false, data);
                break;
        }

        reqBody = test.getLowValue();
        data = reqBody.data;
        if(data.constructor == Array) {
            for(var i = 0; i< data.length; i++) {
                data[i].taskId = uuid.v4()
                data[i].customerData = reqBody.customerData;
                data[i].template = reqBody.template;
            }
        } else {
            data.taskId = uuid.v4()
            data.customerData = reqBody.customerData;
            data.template = reqBody.template;
        }
        priority = reqBody.priority ? reqBody.priority : 'low';
        switch(priority){
            case 'high':
                this.rpush(true, data);
                break;
            default: // low
                this.rpush(false, data);
                break;
        }


    }

    /**
     * New task coming in, should have verify process
     * Maybe verify template & customerData too so when data is used there is no error
     * @param reqBody
     * @param callback
     */
    this.fillTask = function(reqBody, callback) {
        var self = this;
        var valid = this.verifyDataIntegrity(reqBody);
        if (!valid)
            return callback(new Error(error.dataNotValid))

        var data = [];
        var reqData = reqBody.data;
        var customerId = reqBody.customer.id;
        var templateId = reqBody.template.id;
        var ts = reqBody.template.ts;
        var uid = uuid.v4()
        // var uid = 'customer.template'
        if (reqData.constructor == Array) {
            for (var i = 0; i < reqData.length; i++) {
                data[i] = {};
                data[i].data = reqData[i]
                data[i].taskId = uuid.v4()
                data[i].uid = uid
                data[i].customerId = customerId;
                data[i].templateId = templateId;
                data[i].ts = ts;
            }
        } else {
            data = {};
            data.data = reqData;
            data.taskId = uuid.v4()
            data.uid = uid
            data.customerId = customerId;
            data.templateId = templateId;
            data.ts = ts;
        }

        var priority = reqBody.priority ? reqBody.priority : 'low';
        switch (priority) {
            case 'high':
                this.rpush(true, data);
                break;
            default: // low
                this.rpush(false, data);
                break;
        }

        // update script
        var toSave = {
            script: reqBody.template.script,
            ts: ts
        }
        client.hset(script, uid, JSON.stringify(toSave))

        return callback()

    }

    /**
     * distribute task or script or both
     * @param key should be task, script, both
     * @param data include  count
     * @param callback err, data  keep err null if no error
     */
    this.distribute = function(key, data, callback) {
        // var customerData = data.customerData;
        var self = this;
        if(!data.client || !data.client.id || !data.client.password)
            return callback(error.verifyFail)

        this.verifyClient(data.client.id, data.client.password, function(valid) {
            if(!valid)
                return callback(new Error(error.verifyFail))
            if(typeof data == 'string')
                data = JSON.parse(data)
            var count = data.taskCount ? data.taskCount : defaultTaskCount;

            switch (key) {
                case 'task':
                    self.getTask(count, function(err, res) {
                        return callback(err, res)
                    })
                    break;
                case 'script':
                    if(!data.taskId)
                        return callback(error.taskIdNotProvided)
                    self.getScript(data.taskId, function (err, res) {
                        return callback(err, res)
                    })
                    break;
                case 'both':
                    if(!data.taskId)
                        return callback(error.taskIdNotProvided)
                    self.getScript(data.taskId, function (scriptErr, scriptRes) {
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
        })
    }

    this.getTask = function(count, callback) {
        count = count > maxTaskCount ? maxTaskCount : count;
        var result = [];

        client.lrangeAsync(high, 0, -1).then(function (highList) { // get task from high priority
            listToResult(result, highList, 'high', count)
            return count - (highList.length ?  highList.length : 0);
        }).then(function(count) {
            if(count <= 0)
                return callback(null, result)

            client.lrangeAsync(low, 0, -1).then(function(lowList) {
                listToResult(result, lowList, 'low', count)
                return callback(null ,result)
            }).catch(function(err){ return callback(err)})

        }).catch(function(err){return callback(err)})
    }
    
    this.getScript = function(taskId, callback) {
        client.hgetAsync(handling, taskId).then(function(res) {
            if(!res)
                return callback(new Error(error.emptyScript))
            res = JSON.parse(res)
            return res.uid
        }).then(function(uid) {
            client.hgetAsync(script, uid).then(function (resScript) {
                if(!resScript)
                    return callback(new Error(error.emptyScript))
                resScript = JSON.parse(resScript)
                return callback(null, resScript)
            }).catch(function(err){return callback(err)})
        })
    }

    /**
     * receive report from crawler, if success, store data as result_customerId
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
        var data = reqBody.data ? reqBody.data : [];
        if(!reqBody.client)
            return callback(error.verifyFail)
        this.verifyClient(reqBody.client.id, reqBody.client.password, function(valid){
            if(!valid)
                return callback(new Error(error.verifyFail))

            switch(status) {
                case 'success':
                    var key;
                    var field;
                    var result;
                    // save data
                    if(data.constructor == Array) {
                        // var fieldAndResultArray = []
                        data.forEach(function(entry) {
                            client.hgetAsync(handling, entry.taskId).then(function(res) {
                                if(res) {
                                    res = JSON.parse(res)
                                    field = entry.taskId;
                                    result = res
                                    result.result = entry.result
                                    key = 'result_'+res.customerId;
                                    client.hdel(handling, entry.taskId);
                                    client.hset(key, field, JSON.stringify(result))
                                }
                            }).catch(function(err) {return callback(err)})
                        })
                    } else {
                        client.hgetAsync(handling, data.taskId).then(function(res) {
                            if(res) {
                                res = JSON.parse(res)
                                key = 'result_'+res.customerId;
                                field = res.taskId;
                                result = res
                                result.result = data.result

                                client.hdel(handling, data.taskId);
                                client.hset(key, field, JSON.stringify(result));
                            }
                        }).catch(function(err) {return callback(err)})
                    }

                    //add success count to client
                    client.hgetAsync('client', reqBody.client.id).then(JSON.parse).then(function(res) {
                        res.lastActive = new Date();
                        res.successCount++;
                        client.hset('client', reqBody.client.id, JSON.stringify(res))
                    }).catch(function(err) {return callback(err)})

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
                    // add fail count to client
                    client.hgetAsync('client', reqBody.client.id).then(JSON.parse).then(function(res) {
                        res.lastActive = new Date();
                        res.failCount++;
                        client.hset('client', reqBody.client.id, JSON.stringify(res))
                    }).catch(function(err) {return callback(err)})
                    break;
            }
            callback()

        });
    }

    /**
     * get result for customer
     * @param data can contain a uidSet array for the result needed, if not provided then return all
     * @param callback
     */
    this.getResult = function(data, callback) {
        var self = this;
        self.verifyCustomer(data.customer.id, data.customer.verifyCode, function(valid) {
            if(!valid)
                return callback(new Error(error.verifyFail))
            var set = data.uidSet;
            if(set) {
                var result = {};
                client.hgetallAsync('result_'+data.customer.username).then(function(res) {
                    for(var i = 0;i<set.length;i++) {
                        result[set[i]] = res[set[i]]
                    }
                    return callback(null, result)
                }).catch(function(err){return callback(err)})

            } else {
                client.hgetallAsync('result_'+data.customer.username).then(function(res){
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
                    })
                }).then(function(res) {
                    return client.hgetallAsync(handling).then(function(handlingRes) {
                        var result = [];
                        for(var key in handlingRes) {
                            if(count <= 0) {
                                res.handlingRes = result;
                                return callback(null, res);
                            }
                            result.push(JSON.parse(handlingRes[key]))
                            count--;
                        }
                        res.handlingRes = result;
                        return callback(null, res);
                    })
                }).catch(function(err){return callback(err)})
                break;
        }


    }


    this.verifyClient = function(id, password, callback) {
        client.hgetAsync('client', id).then(function(res) {
            if(res) {
                res = JSON.parse(res)
                if(res.password === password && res.alive === true)
                    return callback(true)
            }
            return callback(false)
        }).catch(function(err) { return callback(false) })
    }

    this.verifyCustomer = function(id, verifyCode, callback) {
        client.hgetAsync('customer', id).then(function(res) {
            if(res) {
                res = JSON.parse(res)
                if(res.verifyCode === verifyCode && res.alive === true)
                    return callback(true)
            }
            return callback(false)
        })
    }

    /**
     * when getting new task from server, its integrity should be verified
     * so no further error will be caused
     * @param reqBody
     * @returns {boolean}
     */
    this.verifyDataIntegrity = function(reqBody) {
        var customer = reqBody.customer;
        var template = reqBody.template;
        var data = reqBody.data;
        if(!data)
            return false;
        if(!customer || !customer.id)
            return false;
        if(!template || !template.id || !template.script || !template.ts)
            return false;
        if(data.constructor == Array) {
            for(var i = 0; i<data.length;i++) {
                if(!data[i].searchNo || !data[i].searchType)
                    return false;
            }
        } else {
            if(!data.searchNo || !data.searchType)
                return false;
        }
        return true
    }

}

/**
 * gen random array for getTask use
 * @param random (boolean)
 * @param range (list len)
 * @param count
 * @returns {Array}
 */
function genArray(random, range, count) {
    var arr = [];

    for (var i = 0; i <= range-1; i++) {
        arr.push(i);
    }
    if(!random)
        return arr

    arr.sort(
        function () {
            return 0.5 - Math.random();
        }
    );

    arr.length = count;
    return arr

}


/**
 * put data to result
 * delete from current list (marked by key)
 * store in handling
 * @param result
 * @param list
 * @param key
 * @param count
 */
function listToResult(result, list, key, count) {
    var len = list.length ?  list.length : 0;
    var multi = client.multi()
    var arr = [];
    if(len > count) {
        arr = genArray(true, len, count)
    } else {
        arr = genArray(false, len, count)
    }
    for(var i =  0; i < arr.length; i++) {
        var res = JSON.parse(list[arr[i]])
        var data = {};
        data.taskId = res.taskId;
        data.uid = res.uid
        data.ts = res.ts
        data.data = res.data
        result.push(data)
        client.hset(handling, res.taskId, list[arr[i]]);
        // client.lpop(high);
        multi.lset(key, arr[i], 'del')
    }
    multi.lrem(key, 0, 'del')
    multi.exec()
}

module.exports = new task();