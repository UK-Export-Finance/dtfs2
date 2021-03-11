const moment = require('moment');

const now = () => moment().format('YYYY-MM-DD');

module.exports = { now };
