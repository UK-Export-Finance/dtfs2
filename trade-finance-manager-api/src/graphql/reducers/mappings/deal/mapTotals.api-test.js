const mapTotals = require('./mapTotals');
const { formattedNumber } = require('../../../../utils/number');

describe('mapTotals', () => {
  const mockFacilities = [
    {
      tfm: {
        ukefExposure: 80000.00,
        facilityValueInGBP: 2117.4290881821,
      },
    },
    {
      tfm: {
        ukefExposure: 23000.00,
        facilityValueInGBP: 1034.7800881821,
      },
    },
    {
      tfm: {
        ukefExposure: 8000.00,
        facilityValueInGBP: 3200.567,
      },
    },
  ];

  it('should return formatted total of all facility values', async () => {
    const result = mapTotals(mockFacilities);

    const totalValue = Number(mockFacilities[0].tfm.facilityValueInGBP)
                       + Number(mockFacilities[1].tfm.facilityValueInGBP)
                       + Number(mockFacilities[2].tfm.facilityValueInGBP);

    const expected = `GBP ${formattedNumber(totalValue)}`;
    expect(result.facilitiesValueInGBP).toEqual(expected);
  });

  it('should return formatted total of all facilities ukefExposure', () => {
    const result = mapTotals(mockFacilities);

    const totalUkefExposure = mockFacilities[0].tfm.ukefExposure
      + mockFacilities[1].tfm.ukefExposure
      + mockFacilities[2].tfm.ukefExposure;

    const expected = `GBP ${formattedNumber(totalUkefExposure)}`;
    expect(result.facilitiesUkefExposure).toEqual(expected);
  });
});
