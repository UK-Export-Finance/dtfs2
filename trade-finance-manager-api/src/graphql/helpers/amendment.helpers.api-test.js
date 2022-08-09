const amendmentHelpers = require('./amendment.helpers');
const { CURRENCY } = require('../../constants/currency.constant');
const { FACILITY_TYPE } = require('../../constants/facilities');
const { AMENDMENT_UW_DECISION, AMENDMENT_BANK_DECISION } = require('../../constants/deals');
const api = require('../../v1/api');

describe('amendmentChangeValueExportCurrency()', () => {
  const amendment = { currency: CURRENCY.GBP };

  it('should return a string with currency and value to 2 decimal places', () => {
    amendment.value = 25000;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);
    const expected = `${CURRENCY.GBP} 25,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return a string with currency and value to 2 decimal points even if different currency', () => {
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);
    const expected = `${CURRENCY.JPY} 25,000.00`;
    expect(result).toEqual(expected);
  });

  it('should return null if no value', () => {
    amendment.value = null;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);
    expect(result).toBeNull();
  });

  it('should return null if no currency', () => {
    amendment.value = 25000;
    amendment.currency = null;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);
    expect(result).toBeNull();
  });

  it('should return null if no currency or no value', () => {
    amendment.value = null;
    amendment.currency = null;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);
    expect(result).toBeNull();
  });
});

describe('calculateNewFacilityValue()', () => {
  const amendment = { currency: CURRENCY.GBP };

  it('should return the same number since in GBP', () => {
    amendment.value = 25000;

    const result = amendmentHelpers.calculateNewFacilityValue(null, amendment);
    const expected = amendment.value;
    expect(result).toEqual(expected);
  });

  it('should return a number if different currency', () => {
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;
    const exchangeRate = 7.1;

    const result = amendmentHelpers.calculateNewFacilityValue(exchangeRate, amendment);
    const expected = amendment.value * exchangeRate;
    expect(result).toEqual(expected);
  });

  it('should return null if no facility value or currency in amendment', () => {
    amendment.value = null;
    amendment.currency = null;
    const exchangeRate = 7.1;

    const result = amendmentHelpers.calculateNewFacilityValue(exchangeRate, amendment);
    expect(result).toBeNull();
  });

  it('should return null if no exchange rate if currency not GBP', () => {
    amendment.value = 25000;
    amendment.currency = CURRENCY.JPY;
    const exchangeRate = null;

    const result = amendmentHelpers.calculateNewFacilityValue(exchangeRate, amendment);
    expect(result).toBeNull();
  });
});

describe('calculateUkefExposure()', () => {
  it('should return the cover percentage without rounding when not needed', () => {
    const facilityValueInGBP = '5000';
    const coverPercentage = 80;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);
    const expected = 5000 * (80 / 100);
    expect(result).toEqual(expected);
  });

  it('should return a rounded number when more than 2 decimal places', () => {
    const facilityValueInGBP = '5165.2';
    const coverPercentage = 33;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);
    const expected = 1704.52;
    expect(result).toEqual(expected);
  });

  it('should return null if no facility value', () => {
    const facilityValueInGBP = null;
    const coverPercentage = 33;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });

  it('should return null if no cover percentage', () => {
    const facilityValueInGBP = '5165.2';
    const coverPercentage = null;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });

  it('should return null if no cover percentage and facility value', () => {
    const facilityValueInGBP = null;
    const coverPercentage = null;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });
});

describe('calculateAmendmentTenor()', () => {
  it('should return coverStartDate in correct format if gef coverStartDate', async () => {
    const facilitySnapshot = {
      coverStartDate: new Date('2022-07-20T00:00:00.000+00:00'),
      ukefFacilityType: FACILITY_TYPE.CASH,
    };
    const amendment = { coverEndDate: 2541930208 };

    const result = await amendmentHelpers.calculateAmendmentTenor(facilitySnapshot, amendment);
    const expected = 12;
    expect(result).toEqual(expected);
  });

  it('should return null if no facilitySnapshot', async () => {
    const facilitySnapshot = null;
    const amendment = { coverEndDate: 2541930208 };

    const result = await amendmentHelpers.calculateAmendmentTenor(facilitySnapshot, amendment);
    expect(result).toBeNull();
  });

  it('should return null if no facilitySnapshot coverStartDate', async () => {
    const facilitySnapshot = {
      ukefFacilityType: FACILITY_TYPE.CASH,
    };
    const amendment = { coverEndDate: 2541930208 };

    const result = await amendmentHelpers.calculateAmendmentTenor(facilitySnapshot, amendment);
    expect(result).toBeNull();
  });

  it('should return null if no amendment', async () => {
    const facilitySnapshot = {
      coverStartDate: new Date('2022-07-20T00:00:00.000+00:00'),
      ukefFacilityType: FACILITY_TYPE.CASH,
    };
    const amendment = null;

    const result = await amendmentHelpers.calculateAmendmentTenor(facilitySnapshot, amendment);
    expect(result).toBeNull();
  });

  it('should return null if no amendment coverEndDate', async () => {
    const facilitySnapshot = {
      coverStartDate: new Date('2022-07-20T00:00:00.000+00:00'),
      ukefFacilityType: FACILITY_TYPE.CASH,
    };
    const amendment = { };

    const result = await amendmentHelpers.calculateAmendmentTenor(facilitySnapshot, amendment);
    expect(result).toBeNull();
  });
});

describe('calculateAmendmentTotalExposure()', () => {
  const mockAmendment = {
    value: 5000,
    currency: CURRENCY.GBP,
    amendmentId: '1234',
    requireUkefApproval: true,
    ukefDecision: {
      submitted: true,
      value: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
    },
    bankDecision: {
      submitted: true,
      decision: AMENDMENT_BANK_DECISION.PROCEED,
    },
  };

  const mockFacility = {
    _id: '123',
    facilitySnapshot: {
      type: 'Bond',
      coverPercentage: 25,
    },
    tfm: {
      ukefExposure: 23000.00,
      facilityValueInGBP: 1034.7800881821,
    },
  };

  it('should return exposure value when amendment in progress ', async () => {
    api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);

    const result = await amendmentHelpers.calculateAmendmentTotalExposure(mockFacility);
    const expected = mockAmendment.value * (mockFacility.facilitySnapshot.coverPercentage / 100);
    expect(result).toEqual(expected);
  });

  it('should null if amendment not completed', async () => {
    mockAmendment.bankDecision = { decision: AMENDMENT_BANK_DECISION.null };
    api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);

    const result = await amendmentHelpers.calculateAmendmentTotalExposure(mockFacility);
    expect(result).toBeNull();
  });
});
