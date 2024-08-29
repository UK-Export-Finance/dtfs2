const { CURRENCY, AMENDMENT_STATUS, isTfmFacilityEndDateFeatureFlagEnabled } = require('@ukef/dtfs2-common');
const { orderBy, cloneDeep } = require('lodash');
const { formattedNumber } = require('../../../utils/number');
const { decimalsCount, roundNumber } = require('../../helpers/number');
const isValidFacility = require('./isValidFacility.helper');

// returns the formatted amendment value and currency (without conversion)
const amendmentChangeValueExportCurrency = (amendment) => {
  const { currency, value: amendmentValue } = amendment;

  if (currency && amendmentValue) {
    return `${currency} ${formattedNumber(amendmentValue)}`;
  }

  return null;
};

const roundValue = (valueInGBP) => {
  const totalDecimals = decimalsCount(valueInGBP);

  // rounds to 2 decimal places if decimals greater than 2
  const newValue = totalDecimals > 2 ? roundNumber(valueInGBP, 2) : valueInGBP;

  return newValue;
};

// calculates new facility value in GBP
const calculateNewFacilityValue = (exchangeRate, amendment) => {
  const { currency, value: amendmentValue } = amendment;
  let newValue;

  if (currency && amendmentValue) {
    // if already in GBP, just take the value
    if (currency === CURRENCY.GBP) {
      newValue = amendmentValue;
    } else {
      // if no exchange rate return null
      if (!exchangeRate) {
        return null;
      }
      const valueInGBP = amendmentValue * exchangeRate;
      newValue = roundValue(valueInGBP);
    }

    return newValue;
  }

  return null;
};

// calculates new ukef exposure from amendment value
const calculateUkefExposure = (facilityValueInGBP, coverPercentage) => {
  if (facilityValueInGBP && coverPercentage) {
    // parse float as can have 2 decimal places in facility value
    const calculation = parseFloat(facilityValueInGBP, 10) * (coverPercentage / 100);
    const totalDecimals = decimalsCount(calculation);

    const ukefExposure = totalDecimals > 2 ? roundNumber(calculation, 2) : calculation;

    return ukefExposure;
  }

  return null;
};

/**
 * @typedef {object} LatestCompletedAmendment
 * @property {{ currency: import('@ukef/dtfs2-common').Currency, value: number }} [value]
 * @property {import('@ukef/dtfs2-common').UnixTimestamp} [coverEndDate]
 * @property {number} [amendmentExposurePeriodInMonths]
 * @property {{ exposure: number, timestamp: import('@ukef/dtfs2-common').UnixTimestamp }} [exposure]
 * @property {boolean} [isUsingFacilityEndDate]
 * @property {Date} [facilityEndDate]
 * @property {Date} [bankReviewDate]
 */

/**
 * Get the latest completed amendment values
 * @param {import('@ukef/dtfs2-common').AnyObject} amendments
 * @returns {LatestCompletedAmendment}
 */
const findLatestCompletedAmendment = (amendments) => {
  if (!amendments) {
    return {};
  }
  const completedAmendments = amendments.filter(({ status }) => status === AMENDMENT_STATUS.COMPLETED);
  const sortedAmendments = orderBy(completedAmendments, ['updatedAt', 'version'], ['desc', 'asc']);

  /**
   * The amended coverEndDate can come both from 'amendment' or
   * 'amendment.tfm'. Preference is given to the value coming from
   * 'amendment.tfm', but it is set to the value from 'amendment'
   * if any amendment 'tfm' object does not contain a coverEndDate
   */
  let amendmentTfmCoverEndDate;
  let amendmentCoverEndDate;

  /**
   * @type {LatestCompletedAmendment}
   */
  const latestAmendmentValues = sortedAmendments.reduce((updatedFields, amendment) => {
    if (!amendment.tfm) {
      return updatedFields;
    }
    const existingUpdatedFields = cloneDeep(updatedFields);

    if (!updatedFields.value) {
      existingUpdatedFields.value = amendment.tfm.value;
    }

    if (!updatedFields.amendmentExposurePeriodInMonths) {
      existingUpdatedFields.amendmentExposurePeriodInMonths = amendment.tfm.amendmentExposurePeriodInMonths;
    }
    if (!updatedFields.exposure) {
      existingUpdatedFields.exposure = amendment.tfm.exposure;
    }

    if (isTfmFacilityEndDateFeatureFlagEnabled()) {
      if (updatedFields?.isUsingFacilityEndDate === null || updatedFields?.isUsingFacilityEndDate === undefined) {
        existingUpdatedFields.isUsingFacilityEndDate = amendment.tfm.isUsingFacilityEndDate;
        existingUpdatedFields.facilityEndDate = amendment.tfm.facilityEndDate;
        existingUpdatedFields.bankReviewDate = amendment.tfm.bankReviewDate;
      }
    }

    if (!amendmentTfmCoverEndDate) {
      amendmentTfmCoverEndDate = amendment.tfm.coverEndDate;
    }
    if (!amendmentCoverEndDate) {
      amendmentCoverEndDate = amendment.coverEndDate;
    }

    return existingUpdatedFields;
  }, {});

  latestAmendmentValues.coverEndDate = amendmentTfmCoverEndDate ?? amendmentCoverEndDate;
  return latestAmendmentValues;
};

// calculates the value for total exposure to return for a single amendment
const calculateAmendmentTotalExposure = (facility) => {
  if (isValidFacility(facility)) {
    const { tfm, facilitySnapshot } = facility;
    const { exchangeRate } = tfm;

    if (facility?.amendments?.length) {
      const { coverPercentage, coveredPercentage } = facilitySnapshot;
      const latestAmendmentTFM = findLatestCompletedAmendment(facility.amendments);

      // BSS is coveredPercentage while GEF is coverPercentage
      const coverPercentageValue = coverPercentage || coveredPercentage;

      if (latestAmendmentTFM?.value) {
        const valueInGBP = calculateNewFacilityValue(exchangeRate, latestAmendmentTFM.value);
        const ukefExposureValue = calculateUkefExposure(valueInGBP, coverPercentageValue);

        // sets new exposure value based on amendment value
        return ukefExposureValue;
      }
    }
  }

  return null;
};

module.exports = {
  amendmentChangeValueExportCurrency,
  calculateNewFacilityValue,
  calculateUkefExposure,
  calculateAmendmentTotalExposure,
  findLatestCompletedAmendment,
};
