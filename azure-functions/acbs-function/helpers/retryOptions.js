const df = require('durable-functions');

const firstRetryIntervalInMilliseconds = 5000;
const maxNumberOfAttempts = 5;

const retryOptions = new df.RetryOptions(firstRetryIntervalInMilliseconds, maxNumberOfAttempts);
module.exports = retryOptions;
