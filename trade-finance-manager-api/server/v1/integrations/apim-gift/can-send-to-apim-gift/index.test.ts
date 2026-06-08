import { DEAL_SUBMISSION_TYPE, DEAL_TYPE, TfmDeal, TfmFacility, isTfmApimGiftIntegrationEnabled } from '@ukef/dtfs2-common';
import apiModule from '../../../api';
import { canSendToApimGift } from '.';
import * as generateIssuedFacilitiesQueryStringModule from '../generate-issued-facilities-query-string';
import * as mapFacilitiesToSendToGiftModule from '../map-facilities-to-send-to-gift';
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

const mockFeatureFlag = jest.mocked(isTfmApimGiftIntegrationEnabled);
const mockApi = jest.mocked(apiModule) as jest.Mocked<ApiTypes>;
const mockFindGiftFacilitiesByIds = mockApi.findGiftFacilitiesByIds as jest.MockedFunction<ApiTypes['findGiftFacilitiesByIds']>;
const mockGenerateIssuedFacilitiesQueryString = jest.mocked(generateIssuedFacilitiesQueryStringModule.generateIssuedFacilitiesQueryString);
const mockMapFacilitiesToSendToGift = jest.mocked(mapFacilitiesToSendToGiftModule.mapFacilitiesToSendToGift);

describe('canSendToApimGift', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when APIM/GIFT integration feature flag is disabled', () => {
    beforeEach(() => {
      mockFeatureFlag.mockReturnValue(false);
    });

    it('should return canSubmitFacilitiesToApimGift as false', async () => {
      // Act
      const result = await canSendToApimGift(mockTfmDeal);

      // Assert
      const expected = {
        canSubmitFacilitiesToApimGift: false,
      };

      expect(result).toEqual(expected);
    });

    it('should NOT call findFacilitiesByDealId', async () => {
      // Act
      await canSendToApimGift(mockTfmDeal);

      // Assert
      expect(mockApi.findFacilitiesByDealId).not.toHaveBeenCalled();
    });
  });

  describe('when APIM/GIFT integration feature flag is enabled', () => {
    beforeEach(() => {
      mockFeatureFlag.mockReturnValue(true);
    });

    describe.each([
      {
        dealType: DEAL_TYPE.BSS_EWCS,
        submissionType: DEAL_SUBMISSION_TYPE.AIN,
        isBssEwcsDeal: true,
        isGefDeal: false,
      },
      {
        dealType: DEAL_TYPE.BSS_EWCS,
        submissionType: DEAL_SUBMISSION_TYPE.MIN,
        isBssEwcsDeal: true,
        isGefDeal: false,
      },
      {
        dealType: DEAL_TYPE.GEF,
        submissionType: DEAL_SUBMISSION_TYPE.AIN,
        isBssEwcsDeal: false,
        isGefDeal: true,
      },
      {
        dealType: DEAL_TYPE.GEF,
        submissionType: DEAL_SUBMISSION_TYPE.MIN,
        isBssEwcsDeal: false,
        isGefDeal: true,
      },
    ])('when the deal is $dealType, submission type is $submissionType', ({ dealType, submissionType, isBssEwcsDeal, isGefDeal }) => {
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType,
          submissionType,
        },
        tfm: mockTfmDeal.tfm,
      } as TfmDeal;

      it('should call findFacilitiesByDealId', async () => {
        // Arrange
        const mockIssuedFacility = mockTfmIssuedFacility1;

        mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockIssuedFacility]);
        mockGenerateIssuedFacilitiesQueryString.mockReturnValueOnce(String(mockIssuedFacility.facilitySnapshot.ukefFacilityId));
        mockFindGiftFacilitiesByIds.mockResolvedValueOnce({ facilities: [] });
        mockMapFacilitiesToSendToGift.mockReturnValueOnce({
          facilitiesToSendToApimGift: [mockIssuedFacility],
        });

        // Act
        await canSendToApimGift(mockDeal);

        // Assert
        expect(mockApi.findFacilitiesByDealId).toHaveBeenNthCalledWith(1, mockDeal._id);
      });

      it('should call api.findGiftFacilitiesByIds with the expected query string', async () => {
        // Arrange
        const expectedQueryString = [mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId].join(',');

        mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockTfmIssuedFacility1]);
        mockGenerateIssuedFacilitiesQueryString.mockReturnValueOnce(expectedQueryString);
        mockFindGiftFacilitiesByIds.mockResolvedValueOnce({ facilities: [] });
        mockMapFacilitiesToSendToGift.mockReturnValueOnce({ facilitiesToSendToApimGift: [mockTfmIssuedFacility1] });

        // Act
        await canSendToApimGift(mockDeal);

        // Assert
        expect(mockApi.findGiftFacilitiesByIds).toHaveBeenNthCalledWith(1, expectedQueryString);
      });

      describe('when issued facilities are not in GIFT', () => {
        it('should return canSubmitFacilitiesToApimGift as true', async () => {
          // Arrange
          mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockUnissuedFacility]);
          mockGenerateIssuedFacilitiesQueryString.mockReturnValueOnce(
            [mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId, mockTfmIssuedFacility2.facilitySnapshot.ukefFacilityId].join(','),
          );
          mockFindGiftFacilitiesByIds.mockResolvedValueOnce({ facilities: [] });
          mockMapFacilitiesToSendToGift.mockReturnValueOnce({
            facilitiesToSendToApimGift: [mockTfmIssuedFacility1, mockTfmIssuedFacility2],
          });

          // Act
          const result = await canSendToApimGift(mockDeal);

          // Assert
          const expected = {
            canSubmitFacilitiesToApimGift: true,
            issuedFacilities: [mockTfmIssuedFacility1, mockTfmIssuedFacility2],
            isBssEwcsDeal,
            isGefDeal,
          };

          expect(result).toEqual(expected);
        });
      });

      describe('when issued facilities already exist in GIFT', () => {
        it('should return canSubmitFacilitiesToApimGift as false', async () => {
          // Arrange
          const mockIssuedFacility1 = mockTfmIssuedFacility1;
          const mockIssuedFacility2 = mockTfmIssuedFacility2;

          mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockIssuedFacility1, mockIssuedFacility2]);
          mockGenerateIssuedFacilitiesQueryString.mockReturnValueOnce(
            [mockIssuedFacility1.facilitySnapshot.ukefFacilityId, mockIssuedFacility2.facilitySnapshot.ukefFacilityId].join(','),
          );
          mockFindGiftFacilitiesByIds.mockResolvedValueOnce({
            facilities: [
              { ...mockGiftFacility, facilityId: String(mockIssuedFacility1.facilitySnapshot.ukefFacilityId) } as unknown as TfmFacility,
              { ...mockGiftFacility, facilityId: String(mockIssuedFacility2.facilitySnapshot.ukefFacilityId) } as unknown as TfmFacility,
            ],
          });
          mockMapFacilitiesToSendToGift.mockReturnValueOnce({
            facilitiesToSendToApimGift: [],
          });

          // Act
          const result = await canSendToApimGift(mockDeal);

          // Assert
          const expected = {
            canSubmitFacilitiesToApimGift: false,
            issuedFacilities: [],
            isBssEwcsDeal,
            isGefDeal,
          };

          expect(result).toEqual(expected);
        });
      });

      describe('when the lookup of existing GIFT facilities fails', () => {
        it('should return canSubmitFacilitiesToApimGift as false', async () => {
          // Arrange
          mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockTfmIssuedFacility1, mockTfmIssuedFacility2, mockUnissuedFacility]);
          mockGenerateIssuedFacilitiesQueryString.mockReturnValueOnce(
            [mockTfmIssuedFacility1.facilitySnapshot.ukefFacilityId, mockTfmIssuedFacility2.facilitySnapshot.ukefFacilityId].join(','),
          );
          mockFindGiftFacilitiesByIds.mockResolvedValueOnce(false);

          // Act
          const result = await canSendToApimGift(mockDeal);

          // Assert
          const expected = {
            canSubmitFacilitiesToApimGift: false,
            issuedFacilities: [],
            isBssEwcsDeal,
            isGefDeal,
          };

          expect(result).toEqual(expected);
          expect(mockMapFacilitiesToSendToGift).not.toHaveBeenCalled();
        });
      });

      describe('when no facilities are issued', () => {
        it('should return canSubmitFacilitiesToApimGift as false', async () => {
          // Arrange
          mockApi.findFacilitiesByDealId.mockResolvedValueOnce([mockUnissuedFacility]);

          // Act
          const result = await canSendToApimGift(mockDeal);

          // Assert
          const expected = {
            canSubmitFacilitiesToApimGift: false,
            issuedFacilities: [],
            isBssEwcsDeal,
            isGefDeal,
          };

          expect(result).toEqual(expected);
        });
      });
    });

    describe.each([
      {
        dealType: DEAL_TYPE.BSS_EWCS,
        submissionType: DEAL_SUBMISSION_TYPE.MIA,
      },
      {
        dealType: DEAL_TYPE.GEF,
        submissionType: DEAL_SUBMISSION_TYPE.MIA,
      },
    ])('when the deal is $dealType, submission type is $submissionType', ({ dealType, submissionType }) => {
      const mockDeal = {
        ...mockTfmDeal,
        dealSnapshot: {
          ...mockTfmDeal.dealSnapshot,
          dealType,
          submissionType,
        },
        tfm: mockTfmDeal.tfm,
      } as TfmDeal;

      it('should return canSubmitFacilitiesToApimGift as false', async () => {
        // Act
        const result = await canSendToApimGift(mockDeal);

        // Assert
        const expected = {
          canSubmitFacilitiesToApimGift: false,
        };

        expect(result).toEqual(expected);
      });

      it('should NOT call findFacilitiesByDealId', async () => {
        // Act
        await canSendToApimGift(mockDeal);

        // Assert
        expect(mockApi.findFacilitiesByDealId).not.toHaveBeenCalled();
      });
    });

    describe('when the deal does not have any issued facilities', () => {
      it('should return canSubmitFacilitiesToApimGift as false', async () => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: mockTfmDeal.tfm,
        } as TfmDeal;

        mockApi.findFacilitiesByDealId.mockResolvedValue([mockUnissuedFacility]);

        // Act
        const result = await canSendToApimGift(mockDeal);

        // Assert
        const expected = {
          canSubmitFacilitiesToApimGift: false,
          issuedFacilities: [],
          isBssEwcsDeal: true,
          isGefDeal: false,
        };

        expect(result).toEqual(expected);
      });

      it('should NOT call generateIssuedFacilitiesQueryString', async () => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: mockTfmDeal.tfm,
        } as TfmDeal;

        mockApi.findFacilitiesByDealId.mockResolvedValue([mockUnissuedFacility]);

        // Act
        await canSendToApimGift(mockDeal);

        // Assert
        expect(mockGenerateIssuedFacilitiesQueryString).not.toHaveBeenCalled();
      });

      it('should NOT call findGiftFacilitiesByIds', async () => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: mockTfmDeal.tfm,
        } as TfmDeal;

        mockApi.findFacilitiesByDealId.mockResolvedValue([mockUnissuedFacility]);

        // Act
        await canSendToApimGift(mockDeal);

        // Assert
        expect(mockApi.findGiftFacilitiesByIds).not.toHaveBeenCalled();
      });

      it('should NOT call mapFacilitiesToSendToGift', async () => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: mockTfmDeal.tfm,
        } as TfmDeal;

        mockApi.findFacilitiesByDealId.mockResolvedValue([mockUnissuedFacility]);

        // Act
        await canSendToApimGift(mockDeal);

        // Assert
        expect(mockMapFacilitiesToSendToGift).not.toHaveBeenCalled();
      });
    });

    describe.each([{ partyUrn: undefined }, { partyUrn: null }, { partyUrn: '' }])(
      `when the deal is ${DEAL_TYPE.BSS_EWCS}, but buyer party URN is $partyUrn`,
      ({ partyUrn }) => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: {
            ...mockTfmDeal.tfm,
            parties: {
              ...mockTfmDeal.tfm.parties,
              buyer: {
                partyUrn,
              },
            },
          },
        } as TfmDeal;

        it('should return canSubmitFacilitiesToApimGift as false', async () => {
          mockApi.findFacilitiesByDealId.mockResolvedValue([]);

          // Act
          const result = await canSendToApimGift(mockDeal);

          // Assert
          const expected = {
            canSubmitFacilitiesToApimGift: false,
          };

          expect(result).toEqual(expected);
        });

        it('should NOT call findFacilitiesByDealId', async () => {
          // Act
          await canSendToApimGift(mockDeal);

          // Assert
          expect(mockApi.findFacilitiesByDealId).not.toHaveBeenCalled();
        });
      },
    );

    describe.each([{ exporterCreditRating: undefined }, { exporterCreditRating: null }, { exporterCreditRating: '' }, { exporterCreditRating: ' ' }])(
      'when deal does not have an exporterCreditRating (exporterCreditRating: $exporterCreditRating)',
      ({ exporterCreditRating }) => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType: DEAL_TYPE.GEF,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: {
            ...mockTfmDeal.tfm,
            exporterCreditRating,
          },
        } as TfmDeal;

        it('should return canSubmitFacilitiesToApimGift as false', async () => {
          // Act
          const result = await canSendToApimGift(mockDeal);

          // Assert
          const expected = {
            canSubmitFacilitiesToApimGift: false,
          };

          expect(result).toEqual(expected);
        });

        it('should NOT call findFacilitiesByDealId', async () => {
          // Act
          await canSendToApimGift(mockDeal);

          // Assert
          expect(mockApi.findFacilitiesByDealId).not.toHaveBeenCalled();
        });
      },
    );

    describe('when api.findFacilitiesByDealId throws an error', () => {
      it('should swallow the error and return canSubmitFacilitiesToApimGift as false', async () => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: mockTfmDeal.tfm,
        } as TfmDeal;

        const mockError = new Error('Mock API error');

        mockApi.findFacilitiesByDealId.mockRejectedValueOnce(mockError);

        // Act
        const result = await canSendToApimGift(mockDeal);

        // Assert
        expect(result.canSubmitFacilitiesToApimGift).toEqual(false);
      });

      it('should NOT call generateIssuedFacilitiesQueryString', async () => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: mockTfmDeal.tfm,
        } as TfmDeal;

        const mockError = new Error('Mock API error');

        mockApi.findFacilitiesByDealId.mockRejectedValueOnce(mockError);

        // Act
        await canSendToApimGift(mockDeal);

        // Assert
        expect(mockGenerateIssuedFacilitiesQueryString).not.toHaveBeenCalled();
      });

      it('should log that facilities could not be retrieved from TFM', async () => {
        // Arrange
        const mockDeal = {
          ...mockTfmDeal,
          dealSnapshot: {
            ...mockTfmDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: mockTfmDeal.tfm,
        } as TfmDeal;

        const mockError = new Error('Mock API error');

        mockApi.findFacilitiesByDealId.mockRejectedValueOnce(mockError);
        const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);

        // Act
        await canSendToApimGift(mockDeal);

        // Assert
        expect(consoleInfoSpy).toHaveBeenCalledWith(
          'Issued facilities for deal %s cannot be sent to APIM GIFT - failed to retrieve facilities from TFM',
          String(mockDeal._id),
        );
      });
    });
  });
});
