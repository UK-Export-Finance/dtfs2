const mapUkefExposure = require('./mapUkefExposure');
const { formattedNumber } = require('../../../../utils/number');

describe('mapUkefExposure', () => {
  it('should return tfm.ukefExposure with timestamp', () => {
    const mockFacilityTfm = {
      ukefExposure: '2,469.00',
      ukefExposureCalculationTimestamp: '1606900616651',
    };

    const result = mapUkefExposure(mockFacilityTfm);

    const formattedUkefExposure = formattedNumber(mockFacilityTfm.ukefExposure);

    const expected = `GBP ${formattedUkefExposure} as at ${mockFacilityTfm.ukefExposureCalculationTimestamp}`;
    expect(result).toEqual(expected);
  });
});
