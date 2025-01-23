const { CURRENCY, TFM_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const mapTotals = require('./mapTotals');
const { formattedNumber } = require('../../../../utils/number');

describe('mapTotals', () => {
  const mockAmendmentValueResponse = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
  };

  const mockBondAndLoanFacilities = [
    {
      _id: '1',
      facilitySnapshot: {
        type: 'Bond',
        coverPercentage: 25,
      },
      tfm: {
        ukefExposure: 80000.0,
        facilityValueInGBP: 2117.4290881821,
      },
      amendments: [{ ...mockAmendmentValueResponse }],
    },
    {
      _id: '2',
      facilitySnapshot: {
        type: 'Bond',
        coverPercentage: 25,
      },
      tfm: {
        ukefExposure: 23000.0,
        facilityValueInGBP: 1034.7800881821,
      },
      amendments: [{ ...mockAmendmentValueResponse }],
    },
    {
      _id: '3',
      facilitySnapshot: {
        type: 'Loan',
        coverPercentage: 25,
      },
      tfm: {
        ukefExposure: 8000.0,
        facilityValueInGBP: 3200.567,
      },
      amendments: [{ ...mockAmendmentValueResponse }],
    },
    {
      _id: '4',
      facilitySnapshot: {
        type: 'Loan',
        value: '1234.56',
        currency: { id: CURRENCY.GBP },
        coverPercentage: 25,
      },
      tfm: {
        ukefExposure: 9000.0,
      },
      amendments: [{ ...mockAmendmentValueResponse }],
    },
  ];

  const mockCashAndContingentFacilities = [
    {
      _id: '1',
      facilitySnapshot: {
        type: 'Cash',
        value: '1234.56',
        currency: { id: CURRENCY.GBP },
        coverPercentage: 25,
      },
      tfm: {},
      amendments: [{ ...mockAmendmentValueResponse }],
    },
    {
      _id: '2',
      facilitySnapshot: {
        type: 'Contingent',
        value: '1234.56',
        currency: { id: CURRENCY.GBP },
        coverPercentage: 25,
      },
      tfm: {},
      amendments: [{ ...mockAmendmentValueResponse }],
    },
    {
      _id: '3',
      facilitySnapshot: {
        type: 'Contingent',
        value: '1234.56',
        currency: { id: 'USD' },
        coverPercentage: 25,
      },
      tfm: {
        facilityValueInGBP: 3200.567,
      },
      amendments: [{ ...mockAmendmentValueResponse }],
    },
  ];

  describe('with bond & loan facilities', () => {
    it('should return formatted total of all facility values', () => {
      const result = mapTotals(mockBondAndLoanFacilities);

      const totalValue =
        Number(mockBondAndLoanFacilities[0].tfm.facilityValueInGBP) +
        Number(mockBondAndLoanFacilities[1].tfm.facilityValueInGBP) +
        Number(mockBondAndLoanFacilities[2].tfm.facilityValueInGBP) +
        Number(mockBondAndLoanFacilities[3].facilitySnapshot.value);

      const expected = `${CURRENCY.GBP} ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });

    it('should return formatted total of all facility values when amendment not complete', () => {
      const result = mapTotals(mockBondAndLoanFacilities);

      const totalValue =
        Number(mockBondAndLoanFacilities[0].tfm.facilityValueInGBP) +
        Number(mockBondAndLoanFacilities[1].tfm.facilityValueInGBP) +
        Number(mockBondAndLoanFacilities[2].tfm.facilityValueInGBP) +
        Number(mockBondAndLoanFacilities[3].facilitySnapshot.value);

      const expected = `${CURRENCY.GBP} ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });

    it('should return formatted total of all amended values when amendment completed', () => {
      mockBondAndLoanFacilities.map((facility) => {
        const facilityMapped = { ...facility };

        facilityMapped.amendments[0] = {
          status: TFM_AMENDMENT_STATUS.COMPLETED,
          tfm: {
            value: { ...mockAmendmentValueResponse },
          },
        };
        return facilityMapped;
      });

      const result = mapTotals(mockBondAndLoanFacilities);

      const totalValue =
        Number(mockBondAndLoanFacilities[0].tfm.facilityValueInGBP) +
        Number(mockBondAndLoanFacilities[1].tfm.facilityValueInGBP) +
        Number(mockBondAndLoanFacilities[2].tfm.facilityValueInGBP) +
        Number(mockBondAndLoanFacilities[3].facilitySnapshot.value);

      const notExpected = `${CURRENCY.GBP} ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).not.toEqual(notExpected);

      const newTotal = mockAmendmentValueResponse.value * mockBondAndLoanFacilities.length;
      const expected = `${CURRENCY.GBP} ${formattedNumber(newTotal)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });
  });

  describe('with cash & contingent facilities', () => {
    it('should return formatted total of all facility values', () => {
      const result = mapTotals(mockCashAndContingentFacilities);

      const totalValue =
        Number(mockCashAndContingentFacilities[0].facilitySnapshot.value) +
        Number(mockCashAndContingentFacilities[1].facilitySnapshot.value) +
        Number(mockCashAndContingentFacilities[2].tfm.facilityValueInGBP);

      const expected = `${CURRENCY.GBP} ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });

    it('should return formatted total of all facility values when amendment not complete', () => {
      const result = mapTotals(mockCashAndContingentFacilities);

      const totalValue =
        Number(mockCashAndContingentFacilities[0].facilitySnapshot.value) +
        Number(mockCashAndContingentFacilities[1].facilitySnapshot.value) +
        Number(mockCashAndContingentFacilities[2].tfm.facilityValueInGBP);

      const expected = `${CURRENCY.GBP} ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });

    it('should return formatted total of all amended values when amendment is complete', () => {
      mockCashAndContingentFacilities.map((facility) => {
        const facilityMapped = { ...facility };

        facilityMapped.amendments[0] = {
          status: TFM_AMENDMENT_STATUS.COMPLETED,
          tfm: {
            value: { ...mockAmendmentValueResponse },
          },
        };
        return facilityMapped;
      });
      const result = mapTotals(mockCashAndContingentFacilities);

      const totalValue =
        Number(mockCashAndContingentFacilities[0].facilitySnapshot.value) +
        Number(mockCashAndContingentFacilities[1].facilitySnapshot.value) +
        Number(mockCashAndContingentFacilities[2].tfm.facilityValueInGBP);

      const notExpected = `${CURRENCY.GBP} ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).not.toEqual(notExpected);

      const newTotal = mockAmendmentValueResponse.value * mockCashAndContingentFacilities.length;
      const expected = `${CURRENCY.GBP} ${formattedNumber(newTotal)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });
  });

  it('should return formatted total of all facilities ukefExposure', () => {
    mockBondAndLoanFacilities.map((facility) => {
      const facilityMapped = { ...facility };

      facilityMapped.amendments[0].tfm = {
        value: {},
      };
      return facilityMapped;
    });

    const result = mapTotals(mockBondAndLoanFacilities);

    const totalUkefExposure =
      mockBondAndLoanFacilities[0].tfm.ukefExposure +
      mockBondAndLoanFacilities[1].tfm.ukefExposure +
      mockBondAndLoanFacilities[2].tfm.ukefExposure +
      mockBondAndLoanFacilities[3].tfm.ukefExposure;

    const expected = `${CURRENCY.GBP} ${formattedNumber(totalUkefExposure)}`;
    expect(result.facilitiesUkefExposure).toEqual(expected);
  });

  it('should return formatted total of all facilities ukefExposure when amendment not complete', () => {
    const result = mapTotals(mockBondAndLoanFacilities);

    const totalUkefExposure =
      mockBondAndLoanFacilities[0].tfm.ukefExposure +
      mockBondAndLoanFacilities[1].tfm.ukefExposure +
      mockBondAndLoanFacilities[2].tfm.ukefExposure +
      mockBondAndLoanFacilities[3].tfm.ukefExposure;

    const expected = `${CURRENCY.GBP} ${formattedNumber(totalUkefExposure)}`;
    expect(result.facilitiesUkefExposure).toEqual(expected);
  });

  it('should return formatted total of all amended ukefExposure when amendment complete', () => {
    mockBondAndLoanFacilities.map((facility) => {
      const facilityMapped = { ...facility };

      facilityMapped.amendments[0].tfm = {
        value: { ...mockAmendmentValueResponse },
      };
      return facilityMapped;
    });

    const result = mapTotals(mockBondAndLoanFacilities);

    const totalUkefExposure = 5000;

    const expected = `${CURRENCY.GBP} ${formattedNumber(totalUkefExposure)}`;
    expect(result.facilitiesUkefExposure).toEqual(expected);
  });
});
