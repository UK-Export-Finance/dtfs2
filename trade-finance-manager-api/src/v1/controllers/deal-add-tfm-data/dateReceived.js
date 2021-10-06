const moment = require('moment');
require('moment-timezone'); // monkey-patch to provide moment().tz()

const generateDateFromSubmissionDate = (submissionDate) => {
  const utc = moment(parseInt(submissionDate, 10));
  const localisedTimestamp = utc.tz('Europe/London');

  return localisedTimestamp.format('DD-MM-YYYY');
};

const dateReceived = (submissionDate) =>
  generateDateFromSubmissionDate(submissionDate);

module.exports = {
  generateDateFromSubmissionDate,
  dateReceived,
};
