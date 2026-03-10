import { Facility, TfmDeal, TfmFacility } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import MOCK_TFM_DEAL_AIN_SUBMITTED from '../../../__mocks__/mock-TFM-deal-AIN-submitted';
import { MOCK_FACILITIES } from '../../../__mocks__/mock-facilities';
import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES } from '../constants';
import { mapOverview } from './map-overview';
import { mapRiskDetails } from './map-risk-details';
import { mapApimCreditRiskRatings } from '../../map-apim-credit-risk-ratings';
import api from '../../../api';
import { CreditRiskRating } from '../../../api-response-types/credit-risk-rating';
import { createFacility } from '.';

const mockFacilitySnapshot = MOCK_FACILITIES[0] as unknown as Facility;
const mockTfmDeal = MOCK_TFM_DEAL_AIN_SUBMITTED as unknown as TfmDeal;

jest.mock('../../../api');

describe('createFacility', () => {
  const mockDeal = mockTfmDeal;

  const mockFacility: TfmFacility = {
    _id: new ObjectId(),
    facilitySnapshot: mockFacilitySnapshot,
    tfm: {
      ukefExposure: 100000,
      facilityGuaranteeDates: {
        guaranteeCommencementDate: '2024-01-01',
        guaranteeExpiryDate: '2025-01-01',
      },
    },
  };

  const { facilitySnapshot, tfm } = mockFacility;

  const mockCreditRiskRatings: CreditRiskRating[] = [
    {
      id: 1,
      name: 1,
      description: 'AAA',
      createdAt: '2026-01-14T14:15:00.943Z',
      updatedAt: '2026-01-14T14:15:00.943Z',
      effectiveFrom: '2026-01-14T14:15:00.943Z',
      effectiveTo: '9999-12-31T00:00:00.000Z',
    },
    {
      id: 2,
      name: 2,
      description: 'AA+',
      createdAt: '2026-01-14T14:15:00.943Z',
      updatedAt: '2026-01-14T14:15:00.943Z',
      effectiveFrom: '2026-01-14T14:15:00.943Z',
      effectiveTo: '9999-12-31T00:00:00.000Z',
    },
  ];

  const params = {
    deal: mockDeal,
    dealId: '123',
    exporterPartyUrn: '12345',
    facility: mockFacility,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call api.getCreditRiskRatings', async () => {
    const mockApi = jest.mocked(api) as jest.Mocked<typeof api>;

    const getCreditRiskRatingsSpy = jest.fn().mockResolvedValueOnce(mockCreditRiskRatings);
    mockApi.getCreditRiskRatings = getCreditRiskRatingsSpy;

    await createFacility(params);

    expect(getCreditRiskRatingsSpy).toHaveBeenCalledTimes(1);
  });

  it('should map TFM facility data to the format expected by APIM GIFT for facility creation', async () => {
    // Arrange
    const mockApi = jest.mocked(api) as jest.Mocked<typeof api>;

    mockApi.getCreditRiskRatings = jest.fn().mockResolvedValueOnce(mockCreditRiskRatings);

    // Act
    const result = await createFacility(params);

    // Assert
    const expected = {
      consumer: APIM_GIFT_INTEGRATION.CONSUMER,
      overview: mapOverview({
        currency: facilitySnapshot.currency.id,
        effectiveDate: String(tfm.facilityGuaranteeDates?.guaranteeCommencementDate),
        expiryDate: String(tfm.facilityGuaranteeDates?.guaranteeExpiryDate),
        exporterPartyUrn: params.exporterPartyUrn,
        facilityAmount: Number(tfm.ukefExposure),
        facilityName: facilitySnapshot.name,
        productTypeCode: PRODUCT_TYPES.BSS,
        ukefFacilityId: String(facilitySnapshot.ukefFacilityId),
      }),
      counterparties: [], // TODO: DTFS2-8314
      obligations: [], // TODO: DTFS2-8315
      repaymentProfiles: [], // TODO: DTFS2-8316
      riskDetails: mapRiskDetails({
        creditRiskRatings: mapApimCreditRiskRatings(mockCreditRiskRatings),
        dealId: params.dealId,
        exporterCreditRating: mockDeal.tfm.exporterCreditRating,
        productTypeCode: PRODUCT_TYPES.BSS,
        facilityCategoryCode: String(facilitySnapshot.type),
      }),
    };

    expect(result).toEqual(expected);
  });

  describe('when api.getCreditRiskRatings throws an error', () => {
    beforeEach(() => {
      // Arrange
      const mockApi = jest.mocked(api) as jest.Mocked<typeof api>;

      const mockError = new Error('Mock error');

      mockApi.getCreditRiskRatings = jest.fn().mockRejectedValueOnce(mockError);
    });

    it('should NOT propagate the error', async () => {
      // Act & Assert
      await expect(createFacility(params)).resolves.not.toThrow();
    });

    it('should map TFM facility data to the format expected by APIM GIFT for facility creation', async () => {
      // Act
      const result = await createFacility(params);

      // Assert
      // No need to assert specifics, that is asserted in the previous test - just assert that a result is returned with the expected shape
      expect(result).toBeDefined();
      expect(result).toHaveProperty('consumer');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('counterparties');
      expect(result).toHaveProperty('obligations');
      expect(result).toHaveProperty('repaymentProfiles');
      expect(result).toHaveProperty('riskDetails');
    });
  });
});
