const dotenv = require('dotenv');

dotenv.config();

const apiMaxRequestsInPeriod = process.env.DTFS_CENTRAL_API_MAX_REQUESTS_IN_PERIOD;
const apiPeriodInMilliseconds = process.env.DTFS_CENTRAL_API_PERIOD_IN_MILLISECONDS;

module.exports = {
  apiMaxRequestsInPeriod,
  apiPeriodInMilliseconds,
};
