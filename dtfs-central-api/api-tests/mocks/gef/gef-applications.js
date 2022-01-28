const CONSTANTS = require('../../../src/constants');

const baseApplication = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  maker: {},
  bank: {},
  bankInternalRefName: 'Bank 1',
  additionalRefName: 'Team 1',
  exporter: {},
  createdAt: '2021-01-01T00:00',
  mandatoryVersionId: '123',
  status: CONSTANTS.DEALS.DEAL_STATUS.IN_PROGRESS,
  updatedAt: null,
  editedBy: [null],
  facilitiesUpdated: null,
};

const APPLICATION = [{
  ...baseApplication,
  submissionCount: 0,

},
{
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  ...baseApplication,
  submissionCount: 1,
}];

module.exports = APPLICATION;
