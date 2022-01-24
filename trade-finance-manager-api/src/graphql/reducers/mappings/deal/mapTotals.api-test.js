const mapTotals = require('./mapTotals');
const { formattedNumber } = require('../../../../utils/number');

describe('mapTotals', () => {
  const mockBondAndLoanFacilities = [
    {
      facilitySnapshot: {
        type: 'Bond',
      },
      tfm: {
        ukefExposure: 80000.00,
        facilityValueInGBP: 2117.4290881821,
      },
    },
    {
      facilitySnapshot: {
        type: 'Bond',
      },
      tfm: {
        ukefExposure: 23000.00,
        facilityValueInGBP: 1034.7800881821,
      },
    },
    {
      facilitySnapshot: {
        type: 'Loan',
      },
      tfm: {
        ukefExposure: 8000.00,
        facilityValueInGBP: 3200.567,
      },
    },
    {
      facilitySnapshot: {
        type: 'Loan',
        value: '1234.56',
        currency: { id: 'GBP' },
      },
      tfm: {
        ukefExposure: 9000.00,
      },
    },
  ];

  const mockCashAndContingentFacilities = [
    {
      facilitySnapshot: {
        type: 'Cash',
        value: '1234.56',
        currency: { id: 'GBP' },
      },
      tfm: {},
    },
    {
      facilitySnapshot: {
        type: 'Contingent',
        value: '1234.56',
        currency: { id: 'GBP' },
      },
      tfm: {},
    },
    {
      facilitySnapshot: {
        type: 'Contingent',
        value: '1234.56',
        currency: { id: 'USD' },
      },
      tfm: {
        facilityValueInGBP: 3200.567,
      },
    },
  ];

  describe('with bond & loan facilities', () => {
    it('should return formatted total of all facility values', async () => {
      const result = mapTotals(mockBondAndLoanFacilities);

      const totalValue = Number(mockBondAndLoanFacilities[0].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[1].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[2].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[3].facilitySnapshot.value);

      const expected = `GBP ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });
  });

  describe('with cash & contingent facilities', () => {
    it('should return formatted total of all facility values', async () => {
      const result = mapTotals(mockCashAndContingentFacilities);

      const totalValue = Number(mockCashAndContingentFacilities[0].facilitySnapshot.value)
        + Number(mockCashAndContingentFacilities[1].facilitySnapshot.value)
        + Number(mockCashAndContingentFacilities[2].tfm.facilityValueInGBP);

      const expected = `GBP ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });
  });

  it('should return formatted total of all facilities ukefExposure', () => {
    const result = mapTotals(mockBondAndLoanFacilities);

    const totalUkefExposure = mockBondAndLoanFacilities[0].tfm.ukefExposure
      + mockBondAndLoanFacilities[1].tfm.ukefExposure
      + mockBondAndLoanFacilities[2].tfm.ukefExposure
      + mockBondAndLoanFacilities[3].tfm.ukefExposure;

    const expected = `GBP ${formattedNumber(totalUkefExposure)}`;
    expect(result.facilitiesUkefExposure).toEqual(expected);
  });
});
