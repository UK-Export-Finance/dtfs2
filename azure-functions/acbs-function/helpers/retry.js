const df = require('durable-functions');
const { RETRY_INTERVAL_MS, MAX_RETRY } = require('@ukef/dtfs2-common');

const retry = new df.RetryOptions(RETRY_INTERVAL_MS, MAX_RETRY);

module.exports = retry;
