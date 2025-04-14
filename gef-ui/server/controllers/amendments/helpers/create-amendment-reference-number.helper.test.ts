import * as dtfsCommon from '@ukef/dtfs2-common';
import { PORTAL_AMENDMENT_STATUS, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import api from '../../../services/api';
import { createReferenceNumber } from './create-amendment-reference-number.helper';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';

const getAmendmentsOnDealMock = jest.fn();
const getFacilityMock = jest.fn();
console.error = jest.fn();

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const userToken = 'test-token';
const facility = MOCK_ISSUED_FACILITY.details;

describe('createReferenceNumber', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(api, 'getAmendmentsOnDeal').mockImplementation(getAmendmentsOnDealMock);
    jest.spyOn(api, 'getFacility').mockImplementation(getFacilityMock);

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withStatus(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED)
      .build();

    getAmendmentsOnDealMock.mockResolvedValue([amendment]);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
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
    expect(result).toEqual(`${facility.ukefFacilityId}-03`);
  });

  it('should return the correct reference number when no amendments exist', async () => {
    getAmendmentsOnDealMock.mockResolvedValue([]);

    const result = await createReferenceNumber(dealId, facilityId, userToken);

    expect(getAmendmentsOnDealMock).toHaveBeenCalledWith({
      dealId,
      statuses: [PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED],
      userToken,
    });
    expect(result).toEqual(`${facility.ukefFacilityId}-01`);
  });

  it('should throw an error if amendmentsOnDeal is null', async () => {
    // Arrange
    getAmendmentsOnDealMock.mockResolvedValue(null);

    // Act
    const response = createReferenceNumber(dealId, facilityId, userToken);

    // Assert
    await expect(response).rejects.toThrow('Submitted amendment was not found for the deal');
  });

  it('should throw an error if getFacility details object is null', async () => {
    // Arrange
    getFacilityMock.mockResolvedValue({ details: null });

    // Act
    const response = createReferenceNumber(dealId, facilityId, userToken);

    // Assert
    await expect(response).rejects.toThrow('Facility was not found');
  });

  it('should throw an error if api.getAmendmentsOnDeal fails', async () => {
    // Arrange
    const mockError = new Error('API error');
    getAmendmentsOnDealMock.mockRejectedValue(mockError);

    // Act
    const response = createReferenceNumber(dealId, facilityId, userToken);

    // Assert
    await expect(response).rejects.toThrow(mockError);
  });

  it('should throw an error if api.getFacility fails', async () => {
    // Arrange
    const mockError = new Error('API error');
    getFacilityMock.mockRejectedValue(mockError);

    // Act
    const response = createReferenceNumber(dealId, facilityId, userToken);

    // Assert
    await expect(response).rejects.toThrow(mockError);
  });
});
