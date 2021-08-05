const moment = require('moment');

const formatYear = (year) => (year < 1000 ? (2000 + parseInt(year, 10)).toString() : year && year.toString());
const formatDate = (dateStr, format) => moment(dateStr).format(format);
const formatTimestamp = (dateStr) => moment.utc(Number(dateStr)).format('YYYY-MM-DD');
const convertDateToTimestamp = (dateStr) => moment(dateStr).utc().valueOf().toString();

module.exports = {
  formatYear,
  formatDate,
  formatTimestamp,
  convertDateToTimestamp,
};
