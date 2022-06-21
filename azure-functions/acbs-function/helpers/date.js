const moment = require('moment');

const isDate = (dateStr) => moment(dateStr, 'YYYY-MM-DD', true).isValid();
const isEpoch = (epoch) => moment(epoch, 'x', true).isValid() || moment(epoch, 'X', true).isValid();
const isString = (dateStr) => typeof dateStr === 'string' && !isEpoch(dateStr);
const now = () => moment().format('YYYY-MM-DD');

const formatYear = (year) => (year < 1000 ? (2000 + parseInt(year, 10)).toString() : year && year.toString());
const formatDate = (dateStr) => moment(isDate(dateStr) || isString(dateStr) ? dateStr : Number(dateStr)).format('YYYY-MM-DD');
const formatTimestamp = (dateStr) => moment(isDate(dateStr) || isString(dateStr) ? dateStr : Number(dateStr)).format('YYYY-MM-DD');

const addDay = (date, day) => moment(date).add({ day }).format('YYYY-MM-DD');
const addMonth = (date, months) => moment(date).add({ months }).format('YYYY-MM-DD');
const addYear = (date, years) => moment(date).add({ years }).format('YYYY-MM-DD');

module.exports = {
  isDate,
  isEpoch,
  isString,
  now,
  formatDate,
  formatTimestamp,
  formatYear,
  addDay,
  addMonth,
  addYear,
};
