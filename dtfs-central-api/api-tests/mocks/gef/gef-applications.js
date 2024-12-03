const { DEALS } = require('../../../src/constants');

const baseApplication = {
  dealType: DEALS.DEAL_TYPE.GEF,
  maker: {},
  bank: {},
  bankInternalRefName: 'Bank 1',
  additionalRefName: 'Team 1',
  exporter: {},
  createdAt: '2021-01-01T00:00',
  mandatoryVersionId: 33,
  status: DEALS.DEAL_STATUS.IN_PROGRESS,
  updatedAt: null,
  editedBy: [null],
  facilitiesUpdated: null,
};

const APPLICATION = [
  {
    ...baseApplication,
    submissionCount: 0,
  },
  {
    ...baseApplication,
    submissionCount: 1,
  },
];

module.exports = {
  APPLICATION,
};
