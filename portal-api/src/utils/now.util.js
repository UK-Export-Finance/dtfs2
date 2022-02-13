const moment = require('moment');

// one place that defines how we store timestamps..
//  at least if we decide we don't like current implentation
//  we just change it here + fix the results..
module.exports = () => moment().utc().valueOf().toString();
