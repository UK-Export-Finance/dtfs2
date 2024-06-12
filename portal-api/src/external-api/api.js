const bankHolidays = require('./bank-holidays');
const companies = require('./companies');
const countries = require('./countries');
const currencies = require('./currencies');
const industrySectors = require('./industry-sectors');
const number = require('./number-generator');
const geospatialAddresses = require('./geospatial-addresses');
const sendEmail = require('./send-email');

module.exports = {
  bankHolidays,
  companies,
  countries,
  currencies,
  industrySectors,
  number,
  geospatialAddresses,
  sendEmail,
};
