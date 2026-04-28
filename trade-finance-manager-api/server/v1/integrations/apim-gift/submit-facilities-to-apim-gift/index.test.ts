import { ObjectId } from 'mongodb';
import { APIM_GIFT_PAYLOADS_EXAMPLES, Facility, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import apiModule from '../../../api';
import MOCK_TFM_DEAL_AIN_SUBMITTED from '../../../__mocks__/mock-TFM-deal-AIN-submitted';
import { MOCK_FACILITIES } from '../../../__mocks__/mock-facilities';
import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import { submitFacilitiesToApimGift } from '.';
import { ApimGiftFacilityCreationPayload } from '../../../mappings/apim-gift-payloads/types/apim-gift';

jest.mock('../../../api', () => ({
  __esModule: true,
  default: {
    createGiftFacility: jest.fn(),
  },
}));

jest.mock('../../../mappings/apim-gift-payloads', () => ({
  APIM_GIFT_PAYLOADS: {
    createFacility: jest.fn(),
    createFacilities: jest.fn(),
  },
}));

const mockDeal = MOCK_TFM_DEAL_AIN_SUBMITTED as unknown as TfmDeal;
const mockFacilitySnapshot = MOCK_FACILITIES[0] as unknown as Facility;

const mockFacility: TfmFacility = {
  _id: new ObjectId(),
  facilitySnapshot: mockFacilitySnapshot,
  tfm: {},
};

const createFacilityPayloadSpy = APIM_GIFT_PAYLOADS.createFacility as jest.MockedFunction<typeof APIM_GIFT_PAYLOADS.createFacility>;
const createFacilitiesPayloadSpy = APIM_GIFT_PAYLOADS.createFacilities as jest.MockedFunction<typeof APIM_GIFT_PAYLOADS.createFacilities>;
const createGiftFacilitySpy = apiModule.createGiftFacility as jest.MockedFunction<typeof apiModule.createGiftFacility>;

const mockPayload = APIM_GIFT_PAYLOADS_EXAMPLES.CREATE_FACILITY.VALID_PAYLOAD as unknown as ApimGiftFacilityCreationPayload;
const mockApiResponse = { mock: true };

describe('submitFacilitiesToApimGift', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when one facility is provided', () => {
    beforeEach(() => {
      createFacilityPayloadSpy.mockResolvedValueOnce(mockPayload);

      createGiftFacilitySpy.mockResolvedValueOnce(mockApiResponse);
    });

    it('should call APIM_GIFT_PAYLOADS.createFacility', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility],
      });

      // Assert
      expect(createFacilityPayloadSpy).toHaveBeenNthCalledWith(1, { deal: mockDeal, facility: mockFacility });
    });

    it('should call api.createGiftFacility', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility],
      });

      // Assert
      expect(createGiftFacilitySpy).toHaveBeenNthCalledWith(1, mockPayload);
    });

    it('should NOT call APIM_GIFT_PAYLOADS.createFacilities', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility],
      });

      // Assert
      expect(createFacilitiesPayloadSpy).not.toHaveBeenCalled();
    });

    it('should return the response from api.createGiftFacility', async () => {
      // Act
      const result = await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility],
      });

      expect(result).toEqual(mockApiResponse);
    });
  });

  describe('when multiple facilities are provided', () => {
    const mockFacilityTwo = { ...mockFacility, mockTwo: true };
    const mockFacilityThree = { ...mockFacility, mockThree: true };

    const mockPayloadTwo = {
      ...APIM_GIFT_PAYLOADS_EXAMPLES.CREATE_FACILITY.VALID_PAYLOAD,
      mockTwo: true,
    } as unknown as ApimGiftFacilityCreationPayload;

    const mockPayloadThree = {
      ...APIM_GIFT_PAYLOADS_EXAMPLES.CREATE_FACILITY.VALID_PAYLOAD,
      mockThree: true,
    } as unknown as ApimGiftFacilityCreationPayload;

    beforeEach(() => {
      createFacilitiesPayloadSpy.mockResolvedValueOnce([mockPayload, mockPayloadTwo, mockPayloadThree]);

      createGiftFacilitySpy.mockResolvedValueOnce(mockApiResponse).mockResolvedValueOnce(mockApiResponse).mockResolvedValueOnce(mockApiResponse);
    });

    it('should call APIM_GIFT_PAYLOADS.createFacilities once with all facilities', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility, mockFacilityTwo, mockFacilityThree],
      });

      // Assert
      expect(createFacilitiesPayloadSpy).toHaveBeenNthCalledWith(1, { deal: mockDeal, facilities: [mockFacility, mockFacilityTwo, mockFacilityThree] });
    });

    it('should call api.createGiftFacility', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility, mockFacilityTwo, mockFacilityThree],
      });

      // Assert
      expect(createGiftFacilitySpy).toHaveBeenCalledTimes(3);
      expect(createGiftFacilitySpy).toHaveBeenNthCalledWith(1, mockPayload);
      expect(createGiftFacilitySpy).toHaveBeenNthCalledWith(2, mockPayloadTwo);
      expect(createGiftFacilitySpy).toHaveBeenNthCalledWith(3, mockPayloadThree);
    });

    it('should NOT call APIM_GIFT_PAYLOADS.createFacility', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility, mockFacilityTwo, mockFacilityThree],
      });

      // Assert
      expect(createFacilityPayloadSpy).not.toHaveBeenCalled();
    });

    it('should return flattened responses from api.createGiftFacility', async () => {
      // Act
      const result = await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility, mockFacilityTwo, mockFacilityThree],
      });

      const expected = [mockApiResponse, mockApiResponse, mockApiResponse];

      expect(result).toEqual(expected);
    });
  });
});
