const { getUnixTime, format } = require('date-fns');

const generateDateReceived = (portalSubmissionDate) => ({
  dateReceived: format(Number(portalSubmissionDate), 'dd-MM-yyyy'),
  dateReceivedTimestamp: getUnixTime(Number(portalSubmissionDate)),
});

module.exports = generateDateReceived;
