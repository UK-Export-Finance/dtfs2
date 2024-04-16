const { BANK1_CHECKER1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/portal-users.fixture');
const { submitDealAfterUkefIds } = require('./api');

// This allows us to simulate a submission which would
// normally be done after a successful scheduled Number Generator function call
// TODO: DTFS2-7112 this endpoint is obsolete and should be removed
module.exports = (dealId, dealType) => submitDealAfterUkefIds(dealId, dealType, BANK1_CHECKER1_WITH_MOCK_ID);
