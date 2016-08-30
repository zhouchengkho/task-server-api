/**
 * Created by zhoucheng on 8/16/16.
 */
var uuid = require('uuid');

function test() {
    var high = {
        priority: 'high',
        template: {
            templateId: 'test',
            content: 'test'
        },
        customerData: {
            uid: uuid.v4(),
            customerId: 'keyun'
        },
        data: [{
            content: 'do thing 1'
        }, {
            content: 'do thing 2'
        }, {
            content: 'do thing 3'
        }, {
            content: 'do thing 4'
        }, {
            content: 'do thing 5'
        }
        ]
    }

    var low = {
        priority: 'low',
        template: {
            templateId: 'test',
            content: 'test'
        },
        customerData: {
            uid: uuid.v4(),
            customerId: 'lifeng'
        },
        data: [{
            content: 'do thing 6'
        }, {
            content: 'do thing 7'
        }, {
            content: 'do thing 8'
        }, {
            content: 'do thing 9'
        }, {
            content: 'do thing 10'
        }
        ]
    }

    this.getHighValue = function() {
        return high;
    }
    this.getLowValue = function() {
        return low;
    }
}

module.exports = new test();