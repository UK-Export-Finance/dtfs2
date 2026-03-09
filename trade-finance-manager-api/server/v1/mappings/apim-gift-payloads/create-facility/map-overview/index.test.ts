import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES } from '../../constants';
import { mapOverview } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapOverview', () => {
  it('should map TFM facility data to the format expected by APIM GIFT for facility creation', () => {
    // Arrange
    const params = {
      currency: 'GBP',
      effectiveDate: '2026-01-30',
      expiryDate: '2026-12-31',
      exporterPartyUrn: '12345',
      facilityAmount: 20000,
      facilityName: 'Mock facility name',
      productTypeCode: PRODUCT_TYPES.BSS,
      ukefFacilityId: '123',
    };

    // Act
    const result = mapOverview(params);

    // Assert
    const expected = {
      creditType: DEFAULTS.OVERVIEW.CREDIT_TYPE.BSS, // TODO: DTFS2-8307 - based on product type
      currency: params.currency,
      facilityAmount: params.facilityAmount,
      facilityId: params.ukefFacilityId,
      facilityName: params.facilityName,
      effectiveDate: params.effectiveDate,
      expiryDate: params.expiryDate,
      isRevolving: DEFAULTS.OVERVIEW.IS_REVOLVING.BSS, // TODO: DTFS2-8308 - based on product type
      obligorUrn: params.exporterPartyUrn,
      productTypeCode: params.productTypeCode,
    };

    expect(result).toEqual(expected);
  });
});
