const moment = require('moment');

const formatDateString = (dateStr, fromFormat, toFormat = 'D MMM YYYY') => moment(dateStr, fromFormat).format(toFormat);

module.exports = formatDateString;
