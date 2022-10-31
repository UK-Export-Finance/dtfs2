const mapFacilityTfm = require('./mapFacilityTfm');
const mapUkefExposure = require('./mapUkefExposure');
const mapPremiumSchedule = require('./mapPremiumSchedule');
const mapPremiumTotals = require('./mapPremiumTotals');

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
      premiumSchedule: mockFacilityTfm.premiumSchedule ? mapPremiumSchedule(mockFacilityTfm.premiumSchedule) : [],
      premiumTotals: mockFacilityTfm.premiumSchedule ? mapPremiumTotals(mockFacilityTfm.premiumSchedule) : [],
      creditRating: mockDealTfm.exporterCreditRating,
    };

    expect(result).toEqual(expected);
  });
});
