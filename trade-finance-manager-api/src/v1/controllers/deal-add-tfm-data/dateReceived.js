const { getUnixTime, format } = require('date-fns');

const generateDateReceived = (portalSubmissionDate) => ({
  dateReceived: format(portalSubmissionDate, 'dd-MM-yyyy'),
  dateReceivedTimestamp: getUnixTime(portalSubmissionDate),
});

module.exports = generateDateReceived;
