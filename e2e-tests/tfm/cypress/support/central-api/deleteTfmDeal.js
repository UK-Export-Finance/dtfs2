const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { UNDERWRITER_1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/tfm-users.fixture');
const { deleteTfmDeal } = require('./api');

module.exports = (dealId) => {
  console.info('deleteTfmDeal::');
  deleteTfmDeal(dealId, generateTfmAuditDetails(UNDERWRITER_1_WITH_MOCK_ID._id));
};
