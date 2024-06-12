const bankHolidays = require('./bank-holidays');
const companiesHouse = require('./companies-house');
const countries = require('./countries');
const currencies = require('./currencies');
const industrySectors = require('./industry-sectors');
const number = require('./number-generator');
const geospatialAddresses = require('./geospatial-addresses');
const sendEmail = require('./send-email');

module.exports = {
  bankHolidays,
  companiesHouse,
  countries,
  currencies,
  industrySectors,
  number,
  geospatialAddresses,
  sendEmail,
};
