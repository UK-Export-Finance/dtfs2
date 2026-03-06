import { Facility, TfmFacility } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { MOCK_FACILITIES } from '../../../__mocks__/mock-facilities';
import { APIM_GIFT_INTEGRATION } from '../constants';
import { mapOverview } from './map-overview';
import { mapRiskDetails } from './map-risk-details';
import { facilityCreation } from '.';

const mockFacilitySnapshot = MOCK_FACILITIES[0] as unknown as Facility;

describe('facilityCreation', () => {
  it('should map TFM facility data to the format expected by APIM GIFT for facility creation', () => {
    // Arrange
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

    const params = {
      dealId: '123',
      exporterPartyUrn: '12345',
      facility: mockFacility,
    };

    // Act
    const result = facilityCreation(params);

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
        productTypeCode: 'BSS', // TODO - mapping (via constants?) no hard coding.
        ukefFacilityId: String(facilitySnapshot.ukefFacilityId),
      }),
      counterparties: [], // TODO: DTFS2-8314
      obligations: [], // TODO: DTFS2-8315
      repaymentProfiles: [], // TODO: DTFS2-8316
      riskDetails: mapRiskDetails({
        dealId: params.dealId,
        productTypeCode: 'BSS', // TODO - mapping (via constants?) no hard coding.
        facilityCategoryCode: String(facilitySnapshot.type),
      }),
    };

    expect(result).toEqual(expected);
  });
});
