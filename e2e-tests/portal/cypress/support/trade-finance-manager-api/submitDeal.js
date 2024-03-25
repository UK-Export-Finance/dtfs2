const { submitDealAfterUkefIds } = require('./api');

// This allows us to simulate a submission which would
// normally be done after a successful scheduled Number Generator function call
module.exports = (dealId, dealType) => submitDealAfterUkefIds(dealId, dealType, { _id: '6602f568f609ff532522b472' });
