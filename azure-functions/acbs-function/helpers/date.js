const moment = require('moment');

const isDate = (dateStr) => moment(dateStr, 'YYYY-MM-DD', true).isValid();
const now = () => moment().format('YYYY-MM-DD');

const formatYear = (year) => (year < 1000 ? (2000 + parseInt(year, 10)).toString() : year && year.toString());
const formatDate = (dateStr) => moment(dateStr).format('YYYY-MM-DD');
const formatTimestamp = (dateStr) => moment.utc(isDate(dateStr) ? dateStr : Number(dateStr)).format('YYYY-MM-DD');

const addDay = (date, day) => moment(date).add({ day }).format('YYYY-MM-DD');
const addMonth = (date, months) => moment(date).add({ months }).format('YYYY-MM-DD');
const addYear = (date, years) => moment(date).add({ years }).format('YYYY-MM-DD');

module.exports = {
  isDate,
  now,
  formatDate,
  formatTimestamp,
  formatYear,
  addDay,
  addMonth,
  addYear,
};
