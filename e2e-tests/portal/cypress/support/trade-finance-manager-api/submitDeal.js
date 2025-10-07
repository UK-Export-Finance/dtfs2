const { submitDeal } = require('./api');

// This allows us to simulate a submission which would
// normally be done after a successful scheduled Number Generator function call
// TODO: DTFS2-7112 this endpoint is obsolete and should be removed
module.exports = (dealId, dealType) => submitDeal(dealId, dealType);
