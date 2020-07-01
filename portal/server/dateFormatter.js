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
  const translatedComments = deal.comments ? deal.comments.map((commentEntry) => ({
    ...commentEntry,
    timestamp: toDateTime(commentEntry.timestamp),
  })) : [];

  const translated = {
    ...deal,
    details: {
      ...deal.details,
      submissionDate: toDateOnly(deal.details.submissionDate),
      dateOfLastAction: toDateTime(deal.details.dateOfLastAction),
    },
    comments: translatedComments,
  };

  return translated;
};

const translateAllDatesToExpectedFormat = async (deals) => new Promise((resolve) => {
  if (deals.length === 0) {
    resolve([]);
  } else {
    const translated = [];

    deals.forEach(async (deal) => {
      translated.push(await translateDatesToExpectedFormat(deal));
      if (translated.length === deals.length) {
        resolve(translated);
      }
    });
  }
});

module.exports = {
  translateDatesToExpectedFormat,
  translateAllDatesToExpectedFormat,
};
