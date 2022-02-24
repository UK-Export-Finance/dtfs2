const { getUnixTime, format } = require('date-fns');

const generateDateReceived = () => ({
  dateReceived: format(new Date(), 'dd-MM-yyyy'),
  dateReceivedTimestamp: getUnixTime(new Date()),
});

module.exports = generateDateReceived;
