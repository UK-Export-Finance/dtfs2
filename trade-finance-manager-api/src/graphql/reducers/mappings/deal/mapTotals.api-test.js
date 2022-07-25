const mapTotals = require('./mapTotals');
const { formattedNumber } = require('../../../../utils/number');
const api = require('../../../../v1/api');
const { CURRENCY } = require('../../../../constants/currency');
const { AMENDMENT_UW_DECISION, AMENDMENT_BANK_DECISION } = require('../../../../constants/deals');

describe('mapTotals', () => {
  const mockBondAndLoanFacilities = [
    {
      facilitySnapshot: {
        type: 'Bond',
        coverPercentage: 25,
      },
      tfm: {
        ukefExposure: 80000.00,
        facilityValueInGBP: 2117.4290881821,
      },
    },
    {
      facilitySnapshot: {
        type: 'Bond',
        coverPercentage: 25,
      },
      tfm: {
        ukefExposure: 23000.00,
        facilityValueInGBP: 1034.7800881821,
      },
    },
    {
      facilitySnapshot: {
        type: 'Loan',
        coverPercentage: 25,
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
        coverPercentage: 25,
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
        coverPercentage: 25,
      },
      tfm: {},
    },
    {
      facilitySnapshot: {
        type: 'Contingent',
        value: '1234.56',
        currency: { id: 'GBP' },
        coverPercentage: 25,
      },
      tfm: {},
    },
    {
      facilitySnapshot: {
        type: 'Contingent',
        value: '1234.56',
        currency: { id: 'USD' },
        coverPercentage: 25,
      },
      tfm: {
        facilityValueInGBP: 3200.567,
      },
    },
  ];

  const mockAmendment = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
    requireUkefApproval: true,
    ukefDecision: {
      submitted: true,
      value: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
    },
  };

  beforeEach(() => {
    api.getLatestCompletedAmendment = () => Promise.resolve({});
  });

  describe('with bond & loan facilities', () => {
    it('should return formatted total of all facility values', async () => {
      const result = await mapTotals(mockBondAndLoanFacilities);

      const totalValue = Number(mockBondAndLoanFacilities[0].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[1].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[2].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[3].facilitySnapshot.value);

      const expected = `GBP ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });

    it('should return formatted total of all facility values when amendment not complete', async () => {
      api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);

      const result = await mapTotals(mockBondAndLoanFacilities);

      const totalValue = Number(mockBondAndLoanFacilities[0].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[1].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[2].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[3].facilitySnapshot.value);

      const expected = `GBP ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });

    it('should return formatted total of all amended values when amendment completed', async () => {
      mockAmendment.bankDecision = { decision: AMENDMENT_BANK_DECISION.PROCEED };

      api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);

      const result = await mapTotals(mockBondAndLoanFacilities);

      const totalValue = Number(mockBondAndLoanFacilities[0].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[1].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[2].tfm.facilityValueInGBP)
        + Number(mockBondAndLoanFacilities[3].facilitySnapshot.value);

      const notExpected = `GBP ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).not.toEqual(notExpected);

      const newTotal = mockAmendment.value * mockBondAndLoanFacilities.length;
      const expected = `GBP ${formattedNumber(newTotal)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });
  });

  describe('with cash & contingent facilities', () => {
    it('should return formatted total of all facility values', async () => {
      const result = await mapTotals(mockCashAndContingentFacilities);

      const totalValue = Number(mockCashAndContingentFacilities[0].facilitySnapshot.value)
        + Number(mockCashAndContingentFacilities[1].facilitySnapshot.value)
        + Number(mockCashAndContingentFacilities[2].tfm.facilityValueInGBP);

      const expected = `GBP ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });

    it('should return formatted total of all facility values when amendment not complete', async () => {
      mockAmendment.bankDecision = { decision: null };

      api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);
      const result = await mapTotals(mockCashAndContingentFacilities);

      const totalValue = Number(mockCashAndContingentFacilities[0].facilitySnapshot.value)
        + Number(mockCashAndContingentFacilities[1].facilitySnapshot.value)
        + Number(mockCashAndContingentFacilities[2].tfm.facilityValueInGBP);

      const expected = `GBP ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });

    it('should return formatted total of all amended values when amendment is complete', async () => {
      mockAmendment.bankDecision = { decision: AMENDMENT_BANK_DECISION.PROCEED };

      api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);
      const result = await mapTotals(mockCashAndContingentFacilities);

      const totalValue = Number(mockCashAndContingentFacilities[0].facilitySnapshot.value)
        + Number(mockCashAndContingentFacilities[1].facilitySnapshot.value)
        + Number(mockCashAndContingentFacilities[2].tfm.facilityValueInGBP);

      const notExpected = `GBP ${formattedNumber(totalValue)}`;
      expect(result.facilitiesValueInGBP).not.toEqual(notExpected);

      const newTotal = mockAmendment.value * mockCashAndContingentFacilities.length;
      const expected = `GBP ${formattedNumber(newTotal)}`;
      expect(result.facilitiesValueInGBP).toEqual(expected);
    });
  });

  it('should return formatted total of all facilities ukefExposure', async () => {
    const result = await mapTotals(mockBondAndLoanFacilities);

    const totalUkefExposure = mockBondAndLoanFacilities[0].tfm.ukefExposure
      + mockBondAndLoanFacilities[1].tfm.ukefExposure
      + mockBondAndLoanFacilities[2].tfm.ukefExposure
      + mockBondAndLoanFacilities[3].tfm.ukefExposure;

    const expected = `GBP ${formattedNumber(totalUkefExposure)}`;
    expect(result.facilitiesUkefExposure).toEqual(expected);
  });

  it('should return formatted total of all facilities ukefExposure when amendment not complete', async () => {
    mockAmendment.bankDecision = { decision: null };

    api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);
    const result = await mapTotals(mockBondAndLoanFacilities);

    const totalUkefExposure = mockBondAndLoanFacilities[0].tfm.ukefExposure
      + mockBondAndLoanFacilities[1].tfm.ukefExposure
      + mockBondAndLoanFacilities[2].tfm.ukefExposure
      + mockBondAndLoanFacilities[3].tfm.ukefExposure;

    const expected = `GBP ${formattedNumber(totalUkefExposure)}`;
    expect(result.facilitiesUkefExposure).toEqual(expected);
  });

  it('should return formatted total of all amended ukefExposure when amendment complete', async () => {
    mockAmendment.bankDecision = { decision: AMENDMENT_BANK_DECISION.PROCEED };

    api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);
    const result = await mapTotals(mockBondAndLoanFacilities);

    const totalUkefExposure = 5000;

    const expected = `GBP ${formattedNumber(totalUkefExposure)}`;
    expect(result.facilitiesUkefExposure).toEqual(expected);
  });
});
