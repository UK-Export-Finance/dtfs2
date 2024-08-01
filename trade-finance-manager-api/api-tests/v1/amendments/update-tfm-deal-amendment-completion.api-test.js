const { format } = require('date-fns');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { AUDIT_USER_TYPES, AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const amendmentController = require('../../../src/v1/controllers/amendment.controller');
const api = require('../../../src/v1/api');
const updateFacilityAmendment = require('../utils/updateFacilityAmendment.util');
const MOCK_GEF_AIN_DEAL = require('../../../src/v1/__mocks__/mock-TFM-deal-AIN-submitted');
const { mockUpdateDeal } = require('../../../src/v1/__mocks__/common-api-mocks');
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');

describe('update tfm-deals on amendment completion', () => {
  const mockAmendment = {
    dealId: '6463805ebf6e581d581f9ce0',
    facilityId: '64638083a6970b4aec385180',
    amendmentId: '6463808aecc838173927d090',
    status: AMENDMENT_STATUS.COMPLETED,
  };

  const mockDeal = {
    _id: '123',
    tfm: {
      lastUpdated: 1627976394000,
    },
  };

  const updateDealSpy = jest.fn(() => Promise.resolve(mockDeal));

  beforeEach(() => {
    updateDealSpy.mockClear();
    api.getAmendmentById = jest.fn(() => Promise.resolve(mockAmendment));
    api.updateFacilityAmendment = jest.fn(() => Promise.resolve(mockAmendment));
    api.findOneDeal = jest.fn(() => Promise.resolve(MOCK_GEF_AIN_DEAL));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('updateTFMDealLastUpdated() - should update lastUpdated to now when dealId exists', async () => {
    mockUpdateDeal();
    const result = await amendmentController.updateTFMDealLastUpdated(
      mockAmendment.dealId,
      mockAmendment.facilityId,
      generateTfmAuditDetails(MOCK_USERS[0]._id),
    );

    const expected = format(new Date(), 'dd/MM/yyyy');
    const expectedResult = format(result.tfm.lastUpdated, 'dd/MM/yyyy');
    expect(expectedResult).toEqual(expected);
  });

  it('updateTFMDealLastUpdated() - should return null when dealId is null', async () => {
    mockAmendment.dealId = null;
    const result = await amendmentController.updateTFMDealLastUpdated(
      mockAmendment.dealId,
      mockAmendment.facilityId,
      generateTfmAuditDetails(MOCK_USERS[0]._id),
    );

    expect(result).toBeNull();
  });

  it('updateFacilityAmendment() - should call updateDeal when updateTfmLastUpdated is true', async () => {
    api.updateDeal = updateDealSpy;
    mockAmendment.dealId = '123';

    await updateFacilityAmendment(mockAmendment.facilityId, mockAmendment.amendmentId, { updateTfmLastUpdated: true });
    expect(api.updateDeal).toHaveBeenCalledWith({
      dealId: mockAmendment.dealId,
      dealUpdate: { tfm: { lastUpdated: expect.any(Number) } },
      auditDetails: { userType: AUDIT_USER_TYPES.TFM, id: expect.anything() },
    });
  });

  it('updateFacilityAmendment() - should NOT call updateDeal when updateTfmLastUpdated is null', async () => {
    api.updateDeal = updateDealSpy;
    mockAmendment.dealId = '123';

    await updateFacilityAmendment(mockAmendment.facilityId, mockAmendment.amendmentId, { updateTfmLastUpdated: null });
    expect(api.updateDeal).not.toHaveBeenCalled();
  });

  it('updateFacilityAmendment() - should NOT call updateDeal when updateTfmLastUpdated is true but dealId is null', async () => {
    api.updateDeal = updateDealSpy;
    mockAmendment.dealId = null;

    await updateFacilityAmendment(mockAmendment.facilityId, mockAmendment.amendmentId, { updateTfmLastUpdated: true });
    expect(api.updateDeal).not.toHaveBeenCalled();
  });
});
