const mapTotals = require('./mapTotals');
const { formattedNumber } = require('../../../utils/number');

describe('mapTotals', () => {
  const mockFacilities = [
    {
      facilityValue: '1500.45',
      currency: {
        id: 'GBP',
      },
    },
    {
      facilityValue: '3200.00',
      currency: {
        id: 'GBP',
      },
    },
    {
      facilityValue: '150.10',
      currency: {
        id: 'GBP',
      },
    },
  ];

  it('should return formatted total of all facility values', async () => {
    const result = mapTotals(mockFacilities);

    const totalValue = Number(mockFacilities[0].facilityValue)
                       + Number(mockFacilities[1].facilityValue)
                       + Number(mockFacilities[2].facilityValue);

    const expected = `GBP ${formattedNumber(totalValue)}`;
    expect(result.facilitiesValueInGBP).toEqual(expected);
  });

  // TODO: until we figure out which API to use for conversion from non-GBP.
  it('should NOT calculate non-GBP facilities', () => {
    mockFacilities.push({
      facilityValue: '100000.00',
      currency: {
        id: 'USD',
      },
    });

    const result = mapTotals(mockFacilities);

    const totalValue = Number(mockFacilities[0].facilityValue)
      + Number(mockFacilities[1].facilityValue)
      + Number(mockFacilities[2].facilityValue);

    const expected = `GBP ${formattedNumber(totalValue)}`;
    expect(result.facilitiesValueInGBP).toEqual(expected);
  });

  describe('when no facilities have GBP facilities', () => {
    it('should return empty object', () => {
      const result = mapTotals([]);
      expect(result).toEqual({});
    });
  });
});
