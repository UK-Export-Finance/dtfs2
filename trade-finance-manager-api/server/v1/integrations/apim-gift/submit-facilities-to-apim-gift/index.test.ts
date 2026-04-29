import { ObjectId } from 'mongodb';
import { APIM_GIFT_PAYLOADS_EXAMPLES, Facility, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import apiModule from '../../../api';
import MOCK_TFM_DEAL_AIN_SUBMITTED from '../../../__mocks__/mock-TFM-deal-AIN-submitted';
import { MOCK_FACILITIES } from '../../../__mocks__/mock-facilities';
import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import { ApimGiftFacilityCreationPayload } from '../../../mappings/apim-gift-payloads/types/apim-gift';
import { MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS } from '../../../__mocks__/mock-credit-risk-ratings';
import { MOCK_FACILITY_CATEGORIES } from '../../../__mocks__/mock-facility-categories';
import { getReferenceData } from './get-reference-data';
import { submitFacilitiesToApimGift } from '.';

jest.mock('./get-reference-data', () => ({
  getReferenceData: jest.fn(),
}));

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

const mockIsBssEwcsDeal = true;
const mockIsGefDeal = false;

const createFacilityPayloadSpy = APIM_GIFT_PAYLOADS.createFacility as jest.MockedFunction<typeof APIM_GIFT_PAYLOADS.createFacility>;
const createFacilitiesPayloadSpy = APIM_GIFT_PAYLOADS.createFacilities as jest.MockedFunction<typeof APIM_GIFT_PAYLOADS.createFacilities>;
const createGiftFacilitySpy = apiModule.createGiftFacility as jest.MockedFunction<typeof apiModule.createGiftFacility>;
const getReferenceDataSpy = getReferenceData as jest.MockedFunction<typeof getReferenceData>;

const mockPayload = APIM_GIFT_PAYLOADS_EXAMPLES.CREATE_FACILITY.VALID_PAYLOAD as unknown as ApimGiftFacilityCreationPayload;
const mockApiResponse = { mock: true };

describe('submitFacilitiesToApimGift', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when one facility is provided', () => {
    beforeEach(() => {
      // Arrange
      getReferenceDataSpy.mockResolvedValue({
        creditRiskRatings: MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS,
        facilityCategories: MOCK_FACILITY_CATEGORIES,
      });

      createFacilityPayloadSpy.mockResolvedValueOnce(mockPayload);

      createGiftFacilitySpy.mockResolvedValueOnce(mockApiResponse);
    });

    it('should call APIM_GIFT_PAYLOADS.createFacility', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility],
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
      });

      // Assert
      expect(createFacilityPayloadSpy).toHaveBeenNthCalledWith(1, {
        deal: mockDeal,
        facility: mockFacility,
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
        creditRiskRatings: MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS,
        facilityCategories: MOCK_FACILITY_CATEGORIES,
      });
    });

    it('should call getReferenceData', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility],
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
      });

      // Assert
      expect(getReferenceDataSpy).toHaveBeenCalledTimes(1);
      expect(getReferenceDataSpy).toHaveBeenCalledWith(mockIsGefDeal);
    });

    it('should call api.createGiftFacility', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility],
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
      });

      // Assert
      expect(createGiftFacilitySpy).toHaveBeenNthCalledWith(1, mockPayload);
    });

    it('should NOT call APIM_GIFT_PAYLOADS.createFacilities', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility],
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
      });

      // Assert
      expect(createFacilitiesPayloadSpy).not.toHaveBeenCalled();
    });

    it('should return the response from api.createGiftFacility', async () => {
      // Act
      const result = await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility],
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
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
      // Arrange
      getReferenceDataSpy.mockResolvedValue({
        creditRiskRatings: MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS,
        facilityCategories: MOCK_FACILITY_CATEGORIES,
      });

      createFacilitiesPayloadSpy.mockResolvedValueOnce([mockPayload, mockPayloadTwo, mockPayloadThree]);

      createGiftFacilitySpy.mockResolvedValueOnce(mockApiResponse).mockResolvedValueOnce(mockApiResponse).mockResolvedValueOnce(mockApiResponse);
    });

    it('should call APIM_GIFT_PAYLOADS.createFacilities once with all facilities', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility, mockFacilityTwo, mockFacilityThree],
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
      });

      // Assert
      expect(createFacilitiesPayloadSpy).toHaveBeenNthCalledWith(1, {
        deal: mockDeal,
        facilities: [mockFacility, mockFacilityTwo, mockFacilityThree],
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
        creditRiskRatings: MOCK_CREDIT_RISK_RATINGS_DESCRIPTIONS,
        facilityCategories: MOCK_FACILITY_CATEGORIES,
      });
    });

    it('should call api.createGiftFacility', async () => {
      // Act
      await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility, mockFacilityTwo, mockFacilityThree],
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
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
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
      });

      // Assert
      expect(createFacilityPayloadSpy).not.toHaveBeenCalled();
    });

    it('should return flattened responses from api.createGiftFacility', async () => {
      // Act
      const result = await submitFacilitiesToApimGift({
        deal: mockDeal,
        facilities: [mockFacility, mockFacilityTwo, mockFacilityThree],
        isBssEwcsDeal: mockIsBssEwcsDeal,
        isGefDeal: mockIsGefDeal,
      });

      const expected = [mockApiResponse, mockApiResponse, mockApiResponse];

      expect(result).toEqual(expected);
    });
  });
});
