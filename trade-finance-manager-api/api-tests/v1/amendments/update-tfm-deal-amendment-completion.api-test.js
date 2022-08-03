const { format } = require('date-fns');
const amendmentController = require('../../../src/v1/controllers/amendment.controller');
const { AMENDMENT_STATUS } = require('../../../src/constants/deals');
const externalApis = require('../../../src/v1/api');
const updateFacilityAmendment = require('../utils/updateFacilityAmendment');

describe('update tfm-deals on amendment completion', () => {
  const mockAmendment = {
    dealId: '123',
    facilityId: '321',
    amendmentId: '111',
    status: AMENDMENT_STATUS.COMPLETED,
  };

  const mockDeal = {
    _id: '123',
    tfm: {
      lastUpdated: 1627976394000,
    },
  };

  const updateDealSpy = jest.fn(() => Promise.resolve(
    mockDeal,
  ));

  beforeEach(() => {
    updateDealSpy.mockClear();
    externalApis.getAmendmentById = jest.fn(() => Promise.resolve(mockAmendment));
    externalApis.updateFacilityAmendment = jest.fn(() => Promise.resolve(mockAmendment));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('updateTFMDealLastUpdated() - should update lastUpdated to now when dealId exists', async () => {
    const result = await amendmentController.updateTFMDealLastUpdated(mockAmendment.dealId, mockAmendment.facilityId);

    const expected = format(new Date(), 'dd/MM/yyyy');

    const expectedResult = format(result.tfm.lastUpdated, 'dd/MM/yyyy');

    expect(expectedResult).toEqual(expected);
  });

  it('updateTFMDealLastUpdated() - should return null when dealId is null', async () => {
    mockAmendment.dealId = null;
    const result = await amendmentController.updateTFMDealLastUpdated(mockAmendment.dealId, mockAmendment.facilityId);

    expect(result).toBeNull();
  });

  it('updateFacilityAmendment() - should call updateDeal when updateTfmLastUpdated is true', async () => {
    externalApis.updateDeal = updateDealSpy;
    mockAmendment.dealId = '123';

    await updateFacilityAmendment(mockAmendment.facilityId, mockAmendment.amendmentId, { updateTfmLastUpdated: true });

    expect(externalApis.updateDeal).toHaveBeenCalledWith(mockAmendment.dealId, { tfm: { lastUpdated: expect.any(Number) } });
  });

  it('updateFacilityAmendment() - should not call updateDeal when updateTfmLastUpdated is null', async () => {
    externalApis.updateDeal = updateDealSpy;
    mockAmendment.dealId = '123';

    await updateFacilityAmendment(mockAmendment.facilityId, mockAmendment.amendmentId, { updateTfmLastUpdated: null });

    expect(externalApis.updateDeal).not.toHaveBeenCalled();
  });

  it('updateFacilityAmendment() - should not call updateDeal when updateTfmLastUpdated is true but dealId is null', async () => {
    externalApis.updateDeal = updateDealSpy;
    mockAmendment.dealId = null;

    await updateFacilityAmendment(mockAmendment.facilityId, mockAmendment.amendmentId, { updateTfmLastUpdated: true });

    expect(externalApis.updateDeal).not.toHaveBeenCalled();
  });
});
