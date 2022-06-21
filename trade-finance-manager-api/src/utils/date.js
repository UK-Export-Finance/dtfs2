const moment = require('moment');

const formatYear = (year) => (year < 1000 ? (2000 + parseInt(year, 10)).toString() : year && year.toString());
const formatDate = (dateStr) => moment(dateStr).format('YYYY-MM-DD');
const formatTimestamp = (dateStr) => moment(Number(dateStr)).format('YYYY-MM-DD');
const convertDateToTimestamp = (dateStr) => moment(dateStr).valueOf().toString();

module.exports = {
  formatYear,
  formatDate,
  formatTimestamp,
  convertDateToTimestamp,
};
