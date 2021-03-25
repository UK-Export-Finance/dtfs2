const mapFacilityTfm = require('./mapFacilityTfm');
const mapUkefExposure = require('./mapUkefExposure');

describe('mapFacilityTfm', () => {
  it('should return mapped object', () => {
    const mockFacilityTfm = {
      bondIssuerPartyUrn: '123',
      bondBeneficiaryPartyUrn: '456',
      facilityValueInGBP: '789',
      ukefExposure: '10',
    };

    const mockDealTfm = {
      exporterCreditRating: 'Good (BB-)',
    };

    const result = mapFacilityTfm(mockFacilityTfm, mockDealTfm);

    const expected = {
      ...mockFacilityTfm,
      ukefExposure: mapUkefExposure(mockFacilityTfm),
      creditRating: mockDealTfm.exporterCreditRating,
    };

    expect(result).toEqual(expected);
  });
});
