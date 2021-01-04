const moment = require('moment');

module.exports = () => moment().utc().valueOf().toString();
