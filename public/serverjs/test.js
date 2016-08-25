/**
 * Created by zhoucheng on 8/16/16.
 */
var uuid = require('uuid');

function test() {

    this.getHighValue = function() {
        var high = [{
            template: {
                templateId: 'test',
                content: 'test'
            },
            customerData: {
                uid: uuid.v4(),
                customerId: 'keyun'
            }
        },{
            template: {
                templateId: 'test',
                content: 'test'
            },
            customerData: {
                uid: uuid.v4(),
                customerId: 'keyun'
            }
        },{
            template: {
                templateId: 'test',
                content: 'test'
            },
            customerData: {
                uid: uuid.v4(),
                customerId: 'keyun'
            }
        },{
            template: {
                templateId: 'test',
                content: 'test'
            },
            customerData: {
                uid: uuid.v4(),
                customerId: 'lifeng'
            }
        },{
            template: {
                templateId: 'test',
                content: 'test'
            },
            customerData: {
                uid: uuid.v4(),
                customerId: 'lifeng'
            }
        }
        ];
        return high;
    }
    this.getLowValue = function() {
        var low = [{
            template: {
                templateId: 'test',
                content: 'test'
            },
            customerData: {
                uid: uuid.v4(),
                customerId: 'keyun'
            }
        },{
            template: {
                templateId: 'test',
                content: 'test'
            },
            customerData: {
                uid: uuid.v4(),
                customerId: 'keyun'
            }
        },{
            template: {
                templateId: 'test',
                content: 'test'
            },
            customerData: {
                uid: uuid.v4(),
                customerId: 'lifeng'
            }
        },{
            template: {
                templateId: 'test',
                content: 'test'
            },
            customerData: {
                uid: uuid.v4(),
                customerId: 'lifeng'
            }
        },{
            template: {
                templateId: 'test',
                content: 'test'
            },
            customerData: {
                uid: uuid.v4(),
                customerId: 'lifeng'
            }
        }];
        return low;
    }
}

module.exports = new test();