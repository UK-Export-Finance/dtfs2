const df = require('durable-functions');
// TODO 7456: Enable TS import
// const { RETRY_INTERVAL_MS, MAX_RETRY } = require('@ukef/dtfs2-common');
const {
  DURABLE_FUNCTIONS: {
    RETRY_OPTIONS: { INTERVAL_MS, MAX_RETRY },
  },
} = require('../constants/retry');

const retryOptions = new df.RetryOptions(INTERVAL_MS, MAX_RETRY);

module.exports = retryOptions;
