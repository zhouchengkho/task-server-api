/**
 * Created by zhoucheng on 8/17/16.
 */
var error = {
    verifyFail: 'Failed to verify user info',
    unknownkey: 'Key not known or not defined',
    emptyScript: 'No correspondent script',
    countToBig: 'Can\'t request more than 10 tasks once',
    notInHandling: 'Task no longer in handling',
    DBDown: 'problem with database, contact admin',
    dataNotValid: 'Data missing valid attribute(s), please check',
    userNotExist: 'No correspondent user exists',
    userExist: 'User already exists',
    taskIdNotProvided: 'Please provide correspondent task id',
    adminInited: 'Already has admin, init failed'
}

module.exports = error;