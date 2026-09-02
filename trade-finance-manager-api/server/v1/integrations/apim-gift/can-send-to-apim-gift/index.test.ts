import { TfmFacility, isTfmApimGiftIntegrationEnabled } from '@ukef/dtfs2-common';
import apiModule from '../../../api';
import { canSendToApimGift } from '.';
import * as generateIssuedFacilitiesQueryStringModule from '../generate-issued-facilities-query-string';
import * as mapFacilitiesToSendToGiftModule from '../map-facilities-to-send-to-gift';
import * as getUrnAndDealFlagsModule from './get-urn-and-deal-flags';
import { ApiTypes } from '../../../mappings/apim-gift-payloads/types';
import { mockGiftFacility, mockTfmDeal, mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockUnissuedFacility } from '../test-mocks';

jest.mock('../../../api', () => ({
  __esModule: true,
  default: {
    findFacilitiesByDealId: jest.fn(),
    findGiftFacilitiesByIds: jest.fn(),
  },
}));

jest.mock('@ukef/dtfs2-common', () => {
  const actual = jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common');

  return {
    ...actual,
    isTfmApimGiftIntegrationEnabled: jest.fn(),
  };
});

jest.mock('../generate-issued-facilities-query-string', () => ({
  __esModule: true,
  generateIssuedFacilitiesQueryString: jest.fn(),
}));

jest.mock('../map-facilities-to-send-to-gift', () => ({
  __esModule: true,
  mapFacilitiesToSendToGift: jest.fn(),
}));

jest.mock('./get-urn-and-deal-flags', () => ({
  __esModule: true,
  getUrnAndDealFlags: jest.fn(),
}));

const mockFeatureFlag = jest.mocked(isTfmApimGiftIntegrationEnabled);
const mockApi = jest.mocked(apiModule) as jest.Mocked<ApiTypes>;
const mockFindGiftFacilitiesByIds = mockApi.findGiftFacilitiesByIds as jest.MockedFunction<ApiTypes['findGiftFacilitiesByIds']>;
const mockGenerateIssuedFacilitiesQueryString = jest.mocked(generateIssuedFacilitiesQueryStringModule.generateIssuedFacilitiesQueryString);
const mockMapFacilitiesToSendToGift = jest.mocked(mapFacilitiesToSendToGiftModule.mapFacilitiesToSendToGift);
const mockGetUrnAndDealFlags = jest.mocked(getUrnAndDealFlagsModule.getUrnAndDealFlags);

describe('canSendToApimGift', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when APIM/GIFT integration feature flag is disabled', () => {
    beforeEach(() => {
      mockFeatureFlag.mockReturnValue(false);
    });

    it('should return canSendFacilitiesToApimGift as false', async () => {
      // Act
      const result = await canSendToApimGift(mockTfmDeal);

      // Assert
      expect(result.canSendFacilitiesToApimGift).toBe(false);
    });

    it('should NOT call getUrnAndDealFlags', async () => {
      // Act
      await canSendToApimGift(mockTfmDeal);

      // Assert
      expect(mockGetUrnAndDealFlags).not.toHaveBeenCalled();
    });
  });

  describe('when APIM/GIFT integration feature flag is enabled', () => {
    beforeEach(() => {
      mockFeatureFlag.mockReturnValue(true);
    });

    describe('when deal flags validation fails', () => {
      it('should return canSendFacilitiesToApimGift as false when validDealType is false', async () => {
        // Arrange
        mockGetUrnAndDealFlags.mockReturnValue({
          hasExporterCreditRating: true,
          isBssEwcsDeal: false,
          isGefDeal: false,
          isValidBssEwcsDeal: false,
          isValidGefDeal: false,
          validDealType: false,
          validSubmissionType: true,
        });

        // Act
        const result = await canSendToApimGift(mockTfmDeal);

        // Assert
        expect(result.canSendFacilitiesToApimGift).toBe(false);
        expect(mockApi.findFacilitiesByDealId).not.toHaveBeenCalled();
      });

      it('should return canSendFacilitiesToApimGift as false when validSubmissionType is false', async () => {
        // Arrange
        mockGetUrnAndDealFlags.mockReturnValue({
          hasExporterCreditRating: true,
          isBssEwcsDeal: true,
          isGefDeal: false,
          isValidBssEwcsDeal: true,
          isValidGefDeal: false,
          validDealType: true,
          validSubmissionType: false,
        });

        // Act
        const result = await canSendToApimGift(mockTfmDeal);

        // Assert
        expect(result.canSendFacilitiesToApimGift).toBe(false);
        expect(mockApi.findFacilitiesByDealId).not.toHaveBeenCalled();
      });

      it('should return canSendFacilitiesToApimGift as false when hasExporterCreditRating is false', async () => {
        // Arrange
        mockGetUrnAndDealFlags.mockReturnValue({
          hasExporterCreditRating: false,
          isBssEwcsDeal: true,
          isGefDeal: false,
          isValidBssEwcsDeal: true,
          isValidGefDeal: false,
          validDealType: true,
          validSubmissionType: true,
        });

        // Act
        const result = await canSendToApimGift(mockTfmDeal);

        // Assert
        expect(result.canSendFacilitiesToApimGift).toBe(false);
        expect(mockApi.findFacilitiesByDealId).not.toHaveBeenCalled();
      });

      it('should return canSendFacilitiesToApimGift as false when both isValidBssEwcsDeal and isValidGefDeal are false', async () => {
        // Arrange
        mockGetUrnAndDealFlags.mockReturnValue({
          hasExporterCreditRating: true,
          isBssEwcsDeal: true,
          isGefDeal: false,
          isValidBssEwcsDeal: false,
          isValidGefDeal: false,
          validDealType: true,
          validSubmissionType: true,
        });

        // Act
        const result = await canSendToApimGift(mockTfmDeal);

        // Assert
        expect(result.canSendFacilitiesToApimGift).toBe(false);
        expect(mockApi.findFacilitiesByDealId).not.toHaveBeenCalled();
      });
    });

    describe('when deal flags validation passes', () => {
      beforeEach(() => {
        mockGetUrnAndDealFlags.mockReturnValue({
          hasExporterCreditRating: true,
          isBssEwcsDeal: true,
          isGefDeal: false,
          isValidBssEwcsDeal: true,
          isValidGefDeal: false,
          validDealType: true,
          validSubmissionType: true,
        });
      });

      describe('when no issued facilities exist', () => {
        it('should return canSendFacilitiesToApimGift as false', async () => {
          // Arrange
          mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockUnissuedFacility]);

          // Act
          const result = await canSendToApimGift(mockTfmDeal);

          // Assert
          expect(result.canSendFacilitiesToApimGift).toBe(false);
          expect(result.issuedFacilities).toEqual([]);
        });

        it('should NOT call generateIssuedFacilitiesQueryString', async () => {
          // Arrange
          mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockUnissuedFacility]);

          // Act
          await canSendToApimGift(mockTfmDeal);

          // Assert
          expect(mockGenerateIssuedFacilitiesQueryString).not.toHaveBeenCalled();
        });
      });

      describe('when issued facilities exist and are not in GIFT', () => {
        it('should return canSendFacilitiesToApimGift as true', async () => {
          // Arrange
          mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockTfmIssuedFacility1, mockTfmIssuedFacility2]);
          mockGenerateIssuedFacilitiesQueryString.mockReturnValueOnce('0000000001,0000000002');
          mockFindGiftFacilitiesByIds.mockResolvedValueOnce({ facilities: [] });
          mockMapFacilitiesToSendToGift.mockReturnValueOnce({
            facilitiesToSendToApimGift: [mockTfmIssuedFacility1, mockTfmIssuedFacility2],
          });

          // Act
          const result = await canSendToApimGift(mockTfmDeal);

          // Assert
          expect(result.canSendFacilitiesToApimGift).toBe(true);
          expect(result.issuedFacilities).toEqual([mockTfmIssuedFacility1, mockTfmIssuedFacility2]);
        });
      });

      describe('when issued facilities exist and are already in GIFT', () => {
        it('should return canSendFacilitiesToApimGift as false', async () => {
          // Arrange
          mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockTfmIssuedFacility1, mockTfmIssuedFacility2]);
          mockGenerateIssuedFacilitiesQueryString.mockReturnValueOnce('0000000001,0000000002');
          mockFindGiftFacilitiesByIds.mockResolvedValueOnce({
            facilities: [
              { ...mockGiftFacility, facilityId: '0000000001' } as unknown as TfmFacility,
              { ...mockGiftFacility, facilityId: '0000000002' } as unknown as TfmFacility,
            ],
          });
          mockMapFacilitiesToSendToGift.mockReturnValueOnce({
            facilitiesToSendToApimGift: [],
          });

          // Act
          const result = await canSendToApimGift(mockTfmDeal);

          // Assert
          expect(result.canSendFacilitiesToApimGift).toBe(false);
          expect(result.issuedFacilities).toEqual([]);
        });
      });

      describe('when looking up GIFT facilities fails', () => {
        it('should return canSendFacilitiesToApimGift as false', async () => {
          // Arrange
          mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockTfmIssuedFacility1]);
          mockGenerateIssuedFacilitiesQueryString.mockReturnValueOnce('0000000001');
          mockFindGiftFacilitiesByIds.mockResolvedValueOnce(false);

          // Act
          const result = await canSendToApimGift(mockTfmDeal);

          // Assert
          expect(result.canSendFacilitiesToApimGift).toBe(false);
          expect(mockMapFacilitiesToSendToGift).not.toHaveBeenCalled();
        });
      });

      describe('when looking up TFM facilities fails', () => {
        it('should swallow the error and return canSendFacilitiesToApimGift as false', async () => {
          // Arrange
          const mockError = new Error('API error');
          mockApi.findFacilitiesByDealId.mockRejectedValueOnce(mockError);

          // Act
          const result = await canSendToApimGift(mockTfmDeal);

          // Assert
          expect(result.canSendFacilitiesToApimGift).toBe(false);
          expect(mockGenerateIssuedFacilitiesQueryString).not.toHaveBeenCalled();
        });
      });
    });
  });
});
