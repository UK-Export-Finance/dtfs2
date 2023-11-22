const MOCK_DEAL_MIA_SUBMITTED = require('../__mocks__/mock-deal-MIA-submitted');
const MOCK_DEAL_MIN_GEF = require('../__mocks__/mock-gef-deal-MIN');
const MOCK_DEAL_AIN_SUBMITTED = require('../__mocks__/mock-deal-AIN-submitted');

const dealController = require('./deal.controller');
const acbsController = require('./acbs.controller');
const { mockUpdateDeal, mockFindOneDeal } = require('../__mocks__/common-api-mocks');
const api = require('../api');

describe('canDealBeSubmittedToACBS()', () => {
  it('Should return `FALSE` as the deal is a MIA', () => {
    expect(dealController.canDealBeSubmittedToACBS(MOCK_DEAL_MIA_SUBMITTED.submissionType)).toEqual(false);
  });
  it('Should return `TRUE` as the deal is a MIN', () => {
    expect(dealController.canDealBeSubmittedToACBS(MOCK_DEAL_MIN_GEF.submissionType)).toEqual(true);
  });
  it('Should return `TRUE` as the deal is a AIN', () => {
    expect(dealController.canDealBeSubmittedToACBS(MOCK_DEAL_AIN_SUBMITTED.submissionType)).toEqual(true);
  });
});

describe('updateTfmParty()', () => {
  acbsController.createACBS = jest.fn();

  beforeEach(() => {
    acbsController.createACBS.mockReset();
    api.updateDeal.mockReset();
    api.findOneDeal.mockReset();
    mockUpdateDeal();
    mockFindOneDeal();
  });

  it('Should call `createACBS` when the deal is AIN and exporter has a URN', async () => {
    const tfmUpdate = { exporter: { partyUrn: '123' } };
    await dealController.updateTfmParty(MOCK_DEAL_AIN_SUBMITTED._id, tfmUpdate);

    expect(acbsController.createACBS).toHaveBeenCalled();
  });

  it('Should call `createACBS` when the deal is MIN and exporter has a URN', async () => {
    const tfmUpdate = { exporter: { partyUrn: '123' } };
    await dealController.updateTfmParty(MOCK_DEAL_MIN_GEF._id, tfmUpdate);

    expect(acbsController.createACBS).toHaveBeenCalled();
  });

  it('Should NOT call `createACBS` when the deal is MIA and exporter has a URN', async () => {
    const tfmUpdate = { exporter: { partyUrn: '123' } };
    await dealController.updateTfmParty(MOCK_DEAL_MIA_SUBMITTED._id, tfmUpdate);

    expect(acbsController.createACBS).not.toHaveBeenCalled();
  });

  it('Should NOT call `createACBS` when the deal is MIA and exporter does not have a URN', async () => {
    const tfmUpdate = { exporter: { partyUrn: '' } };
    await dealController.updateTfmParty(MOCK_DEAL_MIA_SUBMITTED._id, tfmUpdate);

    expect(acbsController.createACBS).not.toHaveBeenCalled();
  });
});
