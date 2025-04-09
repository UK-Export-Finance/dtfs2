import * as dtfsCommon from '@ukef/dtfs2-common';
import { PORTAL_AMENDMENT_STATUS, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import api from '../../../services/api';
import { createReferenceNumber } from './create-amendment-reference-number.helper';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';

const getAmendmentsOnDealMock = jest.fn();
console.error = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const userToken = 'test-token';

describe('createReferenceNumber', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(api, 'getAmendmentsOnDeal').mockImplementation(getAmendmentsOnDealMock);

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
      .build();

    getAmendmentsOnDealMock.mockResolvedValue([amendment]);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return the correct reference number when amendments exist', async () => {
    getAmendmentsOnDealMock.mockResolvedValue([amendment, amendment]);

    const result = await createReferenceNumber(dealId, facilityId, userToken);

    expect(getAmendmentsOnDealMock).toHaveBeenCalledWith({
      dealId,
      statuses: [PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED],
      userToken,
    });
    expect(result).toEqual(`${facilityId}-03`);
  });

  it('should return the correct reference number when no amendments exist', async () => {
    getAmendmentsOnDealMock.mockResolvedValue([]);

    const result = await createReferenceNumber(dealId, facilityId, userToken);

    expect(getAmendmentsOnDealMock).toHaveBeenCalledWith({
      dealId,
      statuses: [PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED],
      userToken,
    });
    expect(result).toEqual(`${facilityId}-01`);
  });

  it('should throw an error if amendmentsOnDeal is null', async () => {
    getAmendmentsOnDealMock.mockResolvedValue(null);

    await expect(createReferenceNumber(dealId, facilityId, userToken)).rejects.toThrow('Submitted amendment was not found for the deal');
  });

  it('should throw an error if api.getAmendmentsOnDeal fails', async () => {
    const mockError = new Error('API error');
    getAmendmentsOnDealMock.mockRejectedValue(mockError);

    await expect(createReferenceNumber(dealId, facilityId, userToken)).rejects.toThrow(mockError);
  });
});
