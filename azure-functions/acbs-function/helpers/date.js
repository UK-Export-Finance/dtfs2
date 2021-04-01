const moment = require('moment');

const formatYear = (year) => (year < 1000 ? (2000 + parseInt(year, 10)).toString() : year && year.toString());
const formatDate = (dateStr) => moment(dateStr).format('YYYY-MM-DD');
const formatTimestamp = (dateStr) => moment.utc(Number(dateStr)).format('YYYY-MM-DD');
const now = () => moment().format('YYYY-MM-DD');

module.exports = {
  now, formatDate, formatTimestamp, formatYear,
};
