const mapFacilityTfm = require('./mapFacilityTfm');
const mapUkefExposure = require('./mapUkefExposure');

describe('mapFacilityTfm', () => {
  it('should return object with ukefExposure', () => {
    const mockFacilityTfm = {
      bondIssuerPartyUrn: '123',
      bondBeneficiaryPartyUrn: '456',
      facilityValueInGBP: '789',
      ukefExposure: '10',
    };

    const result = mapFacilityTfm(mockFacilityTfm);

    const expected = {
      ...mockFacilityTfm,
      ukefExposure: mapUkefExposure(mockFacilityTfm),
    };

    expect(result).toEqual(expected);
  });
});
