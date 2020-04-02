const moment = require('moment');

const FULL_TIMESTAMP = 'YYYY MM DD HH:mm:ss:SSS ZZ';
const DATE_ONLY = 'DD/MM/YYYY';
const DATE_TIME = 'DD/MM/YYYY HH:mm';

const toDateOnly = (fullTimestamp) => {
  const timestamp = moment(fullTimestamp, FULL_TIMESTAMP);
  return timestamp.format(DATE_ONLY);
};

const toDateTime = (fullTimestamp) => {
  const timestamp = moment(fullTimestamp, FULL_TIMESTAMP);
  return timestamp.format(DATE_TIME);
};

const translateDatesToExpectedFormat = async (deal) => {
  const translated = {
    ...deal,
    details: {
      ...deal.details,
      submissionDate: toDateOnly(deal.details.submissionDate),
      dateOfLastAction: toDateTime(deal.details.dateOfLastAction),
    },
  };

  return translated;
};

const translateAllDatesToExpectedFormat = async (deals) => new Promise((resolve) => {
  const translated = [];

  deals.forEach(async (deal) => {
    translated.push(await translateDatesToExpectedFormat(deal));
    if (translated.length === deals.length) {
      resolve(translated);
    }
  });
});

module.exports = {
  translateDatesToExpectedFormat,
  translateAllDatesToExpectedFormat,
};
