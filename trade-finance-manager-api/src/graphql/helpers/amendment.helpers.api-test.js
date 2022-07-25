const amendmentHelpers = require('./amendment.helpers');
const { CURRENCY } = require('../../constants/currency');
const { FACILITY_TYPE } = require('../../constants/facilities');

describe('amendmentChangeValueExportCurrency()', () => {
  const amendment = { currency: CURRENCY.GBP };

  it('should return a string with currency and value to 2 d.p', () => {
    amendment.value = 25000;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);

    const expected = `${CURRENCY.GBP} 25,000.00`;

    expect(result).toEqual(expected);
  });

  it('should return a string with currency and value to 2 d.p even if different currency', () => {
    amendment.value = 25000;
    amendment.currency = 'JPY';

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);

    const expected = 'JPY 25,000.00';

    expect(result).toEqual(expected);
  });

  it('should return null if no value', () => {
    amendment.value = null;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);

    const expected = null;

    expect(result).toEqual(expected);
  });

  it('should return null if no currency', () => {
    amendment.value = 25000;
    amendment.currency = null;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);

    const expected = null;

    expect(result).toEqual(expected);
  });

  it('should return null if no currency or no value', () => {
    amendment.value = null;
    amendment.currency = null;

    const result = amendmentHelpers.amendmentChangeValueExportCurrency(amendment);

    const expected = null;

    expect(result).toEqual(expected);
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
    amendment.currency = 'JPY';
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

    const expected = null;

    expect(result).toEqual(expected);
  });

  it('should return null if no exchange rate if currency not GBP', () => {
    amendment.value = 25000;
    amendment.currency = 'JPY';
    const exchangeRate = null;

    const result = amendmentHelpers.calculateNewFacilityValue(exchangeRate, amendment);

    const expected = null;

    expect(result).toEqual(expected);
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

  it('should return a rounded number when more than 2 d.p', () => {
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

    const expected = null;

    expect(result).toEqual(expected);
  });

  it('should return null if no cover percentage', () => {
    const facilityValueInGBP = '5165.2';
    const coverPercentage = null;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);

    const expected = null;

    expect(result).toEqual(expected);
  });

  it('should return null if no cover percentage and facility value', () => {
    const facilityValueInGBP = null;
    const coverPercentage = null;

    const result = amendmentHelpers.calculateUkefExposure(facilityValueInGBP, coverPercentage);

    const expected = null;

    expect(result).toEqual(expected);
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

    const expected = null;

    expect(result).toEqual(expected);
  });

  it('should return null if no facilitySnapshot coverStartDate', async () => {
    const facilitySnapshot = {
      ukefFacilityType: FACILITY_TYPE.CASH,
    };

    const amendment = { coverEndDate: 2541930208 };

    const result = await amendmentHelpers.calculateAmendmentTenor(facilitySnapshot, amendment);

    const expected = null;

    expect(result).toEqual(expected);
  });

  it('should return null if no amendment', async () => {
    const facilitySnapshot = {
      coverStartDate: new Date('2022-07-20T00:00:00.000+00:00'),
      ukefFacilityType: FACILITY_TYPE.CASH,
    };

    const amendment = null;

    const result = await amendmentHelpers.calculateAmendmentTenor(facilitySnapshot, amendment);

    const expected = null;

    expect(result).toEqual(expected);
  });

  it('should return null if no amendment coverEndDate', async () => {
    const facilitySnapshot = {
      coverStartDate: new Date('2022-07-20T00:00:00.000+00:00'),
      ukefFacilityType: FACILITY_TYPE.CASH,
    };

    const amendment = { };

    const result = await amendmentHelpers.calculateAmendmentTenor(facilitySnapshot, amendment);

    const expected = null;

    expect(result).toEqual(expected);
  });
});
