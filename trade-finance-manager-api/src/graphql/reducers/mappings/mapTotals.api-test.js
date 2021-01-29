const mapTotals = require('./mapTotals');
const { formattedNumber } = require('../../../utils/number');
const { stripCommas } = require('../../../utils/string');

describe('mapTotals', () => {
  const mockFacilities = [
    {
      facilityValue: '1500.45',
      currency: {
        id: 'GBP',
      },
      ukefExposure: '80,000.00',
    },
    {
      facilityValue: '3200.00',
      currency: {
        id: 'GBP',
      },
      ukefExposure: '23,000.00',
    },
    {
      facilityValue: '150.10',
      currency: {
        id: 'GBP',
      },
      ukefExposure: '8,000.00',
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

  it('should return formatted total of all facilities ukefExposure', () => {
    const result = mapTotals(mockFacilities);

    const asNumber = (str) => Number(stripCommas(str));

    const totalUkefExposure = asNumber(mockFacilities[0].ukefExposure)
      + asNumber(mockFacilities[1].ukefExposure)
      + asNumber(mockFacilities[2].ukefExposure);

    const expected = `GBP ${formattedNumber(totalUkefExposure)}`;
    expect(result.facilitiesUkefExposure).toEqual(expected);
  });

  // TODO: until we figure out which API to use for conversion from non-GBP.
  it('should NOT calculate non-GBP facilities', () => {
    mockFacilities.push({
      facilityValue: '100000.00',
      currency: {
        id: 'USD',
      },
      ukefExposure: '8,000.00',
    });

    const result = mapTotals(mockFacilities);

    const totalValue = Number(mockFacilities[0].facilityValue)
      + Number(mockFacilities[1].facilityValue)
      + Number(mockFacilities[2].facilityValue);

    const expected = `GBP ${formattedNumber(totalValue)}`;
    expect(result.facilitiesValueInGBP).toEqual(expected);
  });

  describe('when no facilities have GBP facilities', () => {
    it('should not return facilitiesValueInGBP', () => {
      const result = mapTotals([]);
      expect(result.facilitiesValueInGBP).toEqual(undefined);
    });
  });
});
