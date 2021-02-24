const mapTotals = require('./mapTotals');
const { formattedNumber } = require('../../../utils/number');
const { stripCommas } = require('../../../utils/string');

describe('mapTotals', () => {
  const mockFacilities = [
    {
      facilitySnapshot: {
        facilityValue: '1500.45',
        currency: {
          id: 'GBP',
        },
        ukefExposure: '80,000.00',
      },
    },
    {
      facilitySnapshot: {
        facilityValue: '3200.00',
        currency: {
          id: 'GBP',
        },
        ukefExposure: '23,000.00',
      },
    },
    {
      facilitySnapshot: {
        facilityValue: '150.10',
        currency: {
          id: 'GBP',
        },
        ukefExposure: '8,000.00',
      },
    },
  ];

  it('should return formatted total of all facility values', async () => {
    const result = mapTotals(mockFacilities);

    const totalValue = Number(mockFacilities[0].facilitySnapshot.facilityValue)
                       + Number(mockFacilities[1].facilitySnapshot.facilityValue)
                       + Number(mockFacilities[2].facilitySnapshot.facilityValue);

    const expected = `GBP ${formattedNumber(totalValue)}`;
    expect(result.facilitiesValueInGBP).toEqual(expected);
  });

  it('should return formatted total of all facilities ukefExposure', () => {
    const result = mapTotals(mockFacilities);

    const asNumber = (str) => Number(stripCommas(str));

    const totalUkefExposure = asNumber(mockFacilities[0].facilitySnapshot.ukefExposure)
      + asNumber(mockFacilities[1].facilitySnapshot.ukefExposure)
      + asNumber(mockFacilities[2].facilitySnapshot.ukefExposure);

    const expected = `GBP ${formattedNumber(totalUkefExposure)}`;
    expect(result.facilitiesUkefExposure).toEqual(expected);
  });

  // TODO: until we figure out which API to use for conversion from non-GBP.
  describe('when some facilities are NOT GBP', () => {
    it('should not return facilitiesValueInGBP', () => {
      const result = mapTotals([
        ...mockFacilities,
        {
          facilitySnapshot: {
            facilityValue: '150.10',
            currency: {
              id: 'USD',
            },
            ukefExposure: '8,000.00',
          },
        },
      ]);
      expect(result.facilitiesValueInGBP).toEqual(undefined);
    });
  });
});
