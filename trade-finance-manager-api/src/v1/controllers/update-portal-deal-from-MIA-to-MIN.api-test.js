const { updatePortalDealFromMIAtoMIN } = require('./update-portal-deal-from-MIA-to-MIN');
const api = require('../api');

const CONSTANTS = require('../../constants');

describe('updatePortalDealFromMIAtoMIN()', () => {
  const checker = {
    _id: '1234',
    username: 'checker@checker',
    roles: ['checker'],
    bank: {
      id: '1',
      name: 'bank',
    },
    firstname: 'bob',
    surname: 'bob',
  };

  const dealId = '123';

  beforeEach(() => {
    api.updatePortalGefDeal = jest.fn(() => Promise.resolve({}));
    api.updatePortalDeal = jest.fn(() => Promise.resolve({}));
    api.updateGefMINActivity = jest.fn(() => Promise.resolve({}));
  });

  it('should return the dealUpdate object on gef deal update', async () => {
    const update = await updatePortalDealFromMIAtoMIN(dealId, CONSTANTS.DEALS.DEAL_TYPE.GEF, checker);

    const dealUpdate = {
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      checkerMIN: checker,
      manualInclusionNoticeSubmissionDate: expect.any(String),
    };

    expect(update).toEqual(dealUpdate);
  });

  it('should return the dealUpdate object on BSS deal update', async () => {
    const update = await updatePortalDealFromMIAtoMIN(dealId, CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, checker);

    const dealUpdate = {
      submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
      details: {
        checkerMIN: checker,
        manualInclusionNoticeSubmissionDate: expect.any(String),
      },
    };

    expect(update).toEqual(dealUpdate);
  });

  it('should return undefined if no deal type', async () => {
    const update = await updatePortalDealFromMIAtoMIN(dealId, '', checker);

    expect(update).toBeUndefined();
  });
});
