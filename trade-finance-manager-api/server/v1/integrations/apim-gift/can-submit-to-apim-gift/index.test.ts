import { DEAL_SUBMISSION_TYPE, DEAL_TYPE, TfmDeal, TfmFacility, isTfmApimGiftIntegrationEnabled } from '@ukef/dtfs2-common';
import apiModule from '../../../api';
import MOCK_TFM_DEAL_AIN_SUBMITTED from '../../../__mocks__/mock-TFM-deal-AIN-submitted';
import { canSubmitToApimGift } from '.';

jest.mock('../../../api', () => ({
  __esModule: true,
  default: {
    findFacilitiesByDealId: jest.fn(),
  },
}));

jest.mock('@ukef/dtfs2-common', () => {
  const actual = jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common');

  return {
    ...actual,
    isTfmApimGiftIntegrationEnabled: jest.fn(),
  };
});

const mockBaseDeal = MOCK_TFM_DEAL_AIN_SUBMITTED as unknown as TfmDeal;

const mockTfmObject = {
  parties: {
    buyer: {
      partyUrn: 'Mock party URN',
    },
  },
  exporterCreditRating: 'Acceptable (B+)',
};

const mockedFeatureFlag = isTfmApimGiftIntegrationEnabled as jest.MockedFunction<typeof isTfmApimGiftIntegrationEnabled>;
const mockedFindFacilitiesByDealId = apiModule.findFacilitiesByDealId as jest.MockedFunction<typeof apiModule.findFacilitiesByDealId>;

describe('canSubmitToApimGift', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when APIM/GIFT integration feature flag is disabled', () => {
    beforeEach(() => {
      mockedFeatureFlag.mockReturnValue(false);
    });

    it('should return canSubmitFacilitiesToApimGift as false', async () => {
      // Act
      const result = await canSubmitToApimGift(mockBaseDeal);

      // Assert
      const expected = {
        canSubmitFacilitiesToApimGift: false,
      };

      expect(result).toEqual(expected);
    });

    it('should NOT call findFacilitiesByDealId', async () => {
      // Act
      await canSubmitToApimGift(mockBaseDeal);

      // Assert
      expect(mockedFindFacilitiesByDealId).not.toHaveBeenCalled();
    });
  });

  describe('when APIM/GIFT integration feature flag is enabled', () => {
    beforeEach(() => {
      mockedFeatureFlag.mockReturnValue(true);
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
        ...mockBaseDeal,
        dealSnapshot: {
          ...mockBaseDeal.dealSnapshot,
          dealType,
          submissionType,
        },
        tfm: mockTfmObject,
      } as TfmDeal;

      it('should call findFacilitiesByDealId', async () => {
        // Arrange
        mockedFindFacilitiesByDealId.mockResolvedValueOnce([]);

        // Act
        await canSubmitToApimGift(mockDeal);

        // Assert
        expect(mockedFindFacilitiesByDealId).toHaveBeenCalledTimes(1);
        expect(mockedFindFacilitiesByDealId).toHaveBeenCalledWith(mockDeal._id);
      });

      it('should return canSubmitFacilitiesToApimGift as true and only issued facilities when there is at least one issued facility', async () => {
        // Arrange
        const mockFacilitiesResponse: TfmFacility[] = [
          {
            facilitySnapshot: {
              hasBeenIssued: true,
            },
          } as unknown as TfmFacility,
          {
            facilitySnapshot: {
              hasBeenIssued: false,
            },
          } as unknown as TfmFacility,
        ];

        mockedFindFacilitiesByDealId.mockResolvedValueOnce(mockFacilitiesResponse);

        // Act
        const result = await canSubmitToApimGift(mockDeal);

        // Assert
        const expected = {
          canSubmitFacilitiesToApimGift: true,
          issuedFacilities: [mockFacilitiesResponse[0]],
          isBssEwcsDeal,
          isGefDeal,
        };

        expect(result).toEqual(expected);
      });

      describe('when no facilities are issued', () => {
        it('should return canSubmitFacilitiesToApimGift as false', async () => {
          // Arrange
          const mockFacilitiesResponse: TfmFacility[] = [
            {
              facilitySnapshot: {
                hasBeenIssued: false,
              },
            } as unknown as TfmFacility,
          ];

          mockedFindFacilitiesByDealId.mockResolvedValueOnce(mockFacilitiesResponse);

          // Act
          const result = await canSubmitToApimGift(mockDeal);

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
        ...mockBaseDeal,
        dealSnapshot: {
          ...mockBaseDeal.dealSnapshot,
          dealType,
          submissionType,
        },
        tfm: mockTfmObject,
      } as TfmDeal;

      it('should return canSubmitFacilitiesToApimGift as false', async () => {
        // Act
        const result = await canSubmitToApimGift(mockDeal);

        // Assert
        const expected = {
          canSubmitFacilitiesToApimGift: false,
        };

        expect(result).toEqual(expected);
      });

      it('should NOT call findFacilitiesByDealId', async () => {
        // Act
        await canSubmitToApimGift(mockDeal);

        // Assert
        expect(mockedFindFacilitiesByDealId).not.toHaveBeenCalled();
      });
    });

    describe('when the deal does not have any issued facilities', () => {
      it('should return canSubmitFacilitiesToApimGift as false', async () => {
        // Arrange
        const mockDeal = {
          ...mockBaseDeal,
          dealSnapshot: {
            ...mockBaseDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: mockTfmObject,
        } as TfmDeal;

        mockedFindFacilitiesByDealId.mockResolvedValue([]);

        // Act
        const result = await canSubmitToApimGift(mockDeal);

        // Assert
        const expected = {
          canSubmitFacilitiesToApimGift: false,
          issuedFacilities: [],
          isBssEwcsDeal: true,
          isGefDeal: false,
        };

        expect(result).toEqual(expected);
      });
    });

    describe.each([{ partyUrn: undefined }, { partyUrn: null }, { partyUrn: '' }])(
      `when the deal is ${DEAL_TYPE.BSS_EWCS}, but buyer party URN is $partyUrn`,
      ({ partyUrn }) => {
        // Arrange
        const mockDeal = {
          ...mockBaseDeal,
          dealSnapshot: {
            ...mockBaseDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: {
            parties: {
              buyer: {
                partyUrn,
              },
            },
          },
        } as TfmDeal;

        it('should return canSubmitFacilitiesToApimGift as false', async () => {
          mockedFindFacilitiesByDealId.mockResolvedValue([]);

          // Act
          const result = await canSubmitToApimGift(mockDeal);

          // Assert
          const expected = {
            canSubmitFacilitiesToApimGift: false,
          };

          expect(result).toEqual(expected);
        });

        it('should NOT call findFacilitiesByDealId', async () => {
          // Act
          await canSubmitToApimGift(mockDeal);

          // Assert
          expect(mockedFindFacilitiesByDealId).not.toHaveBeenCalled();
        });
      },
    );

    describe.each([{ exporterCreditRating: undefined }, { exporterCreditRating: null }, { exporterCreditRating: '' }])(
      'when deal does not have exporterCreditRating (exporterCreditRating: $exporterCreditRating)',
      ({ exporterCreditRating }) => {
        // Arrange
        const mockDeal = {
          ...mockBaseDeal,
          dealSnapshot: {
            ...mockBaseDeal.dealSnapshot,
            dealType: DEAL_TYPE.GEF,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: {
            ...mockTfmObject,
            exporterCreditRating,
          },
        } as TfmDeal;

        it('should return canSubmitFacilitiesToApimGift as false', async () => {
          // Act
          const result = await canSubmitToApimGift(mockDeal);

          // Assert
          const expected = {
            canSubmitFacilitiesToApimGift: false,
          };

          expect(result).toEqual(expected);
        });

        it('should NOT call findFacilitiesByDealId', async () => {
          // Act
          await canSubmitToApimGift(mockDeal);

          // Assert
          expect(mockedFindFacilitiesByDealId).not.toHaveBeenCalled();
        });
      },
    );

    describe('when api.findFacilitiesByDealId throws an error', () => {
      it('should swallow the error and return issuedFacilities as an empty array', async () => {
        // Arrange
        const mockDeal = {
          ...mockBaseDeal,
          dealSnapshot: {
            ...mockBaseDeal.dealSnapshot,
            dealType: DEAL_TYPE.BSS_EWCS,
            submissionType: DEAL_SUBMISSION_TYPE.AIN,
          },
          tfm: mockTfmObject,
        } as TfmDeal;

        const mockError = new Error('Mock API error');

        mockedFindFacilitiesByDealId.mockRejectedValueOnce(mockError);

        // Act
        const result = await canSubmitToApimGift(mockDeal);

        // Assert
        expect(result.issuedFacilities).toEqual([]);
      });
    });
  });
});
