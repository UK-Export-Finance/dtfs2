const {
  calculateUkefExposure,
  getGBPValue,
  formattedNumber,
  TFM_AMENDMENT_STATUS,
  PORTAL_AMENDMENT_STATUS,
  isFutureEffectiveDate,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
} = require('@ukef/dtfs2-common');
const { orderBy, cloneDeep } = require('lodash');
const isValidFacility = require('./isValidFacility.helper');

// returns the formatted amendment value and currency (without conversion)
const amendmentChangeValueExportCurrency = (amendment) => {
  const { currency, value: amendmentValue } = amendment;

  if (currency && amendmentValue) {
    return `${currency} ${formattedNumber(amendmentValue)}`;
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
 * @param {import('@ukef/dtfs2-common').FacilityAmendment[]} amendments
 * @returns {LatestCompletedAmendment}
 */
const findLatestCompletedAmendment = (amendments) => {
  if (!amendments) {
    return {};
  }
  const completedAmendments = amendments.filter(({ status }) => status === TFM_AMENDMENT_STATUS.COMPLETED || status === PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED);

  // sort by version number descending - latest completed amendment first in array
  let sortedAmendments = orderBy(completedAmendments, ['version'], ['desc']);

  /**
   * if the feature flag is enabled,
   * sort by referenceNumber first (if it exists)
   * if it is an empty string, then it is set to undefined and then sorted by version
   * and reference number does not exist at all, then sort by version
   */
  if (isPortalFacilityAmendmentsFeatureFlagEnabled()) {
    sortedAmendments = orderBy(
      completedAmendments,
      [
        // First sort: if referenceNumber exists and is not empty string, then 1 else 0 - so sorted first
        (amendment) => (amendment?.referenceNumber && amendment.referenceNumber !== '' ? 1 : 0),
        // Second sort: if referenceNumber exists, sort by it or else set it to undefined
        (amendment) => amendment?.referenceNumber || undefined,
        // third sort: by version, for those without reference number
        (amendment) => amendment.version,
      ],
      ['desc', 'desc', 'desc'],
    );
  }

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

    const hasFutureEffectiveDate = amendment.effectiveDate && isFutureEffectiveDate(amendment?.effectiveDate);

    if (!updatedFields.value && !hasFutureEffectiveDate) {
      existingUpdatedFields.value = amendment.tfm.value;
    }

    if (!updatedFields.amendmentExposurePeriodInMonths && !hasFutureEffectiveDate) {
      existingUpdatedFields.amendmentExposurePeriodInMonths = amendment.tfm.amendmentExposurePeriodInMonths;
    }
    if (!updatedFields.exposure && !hasFutureEffectiveDate) {
      existingUpdatedFields.exposure = amendment.tfm.exposure;
    }

    if ((updatedFields?.isUsingFacilityEndDate === null || updatedFields?.isUsingFacilityEndDate === undefined) && !hasFutureEffectiveDate) {
      existingUpdatedFields.isUsingFacilityEndDate = amendment.tfm.isUsingFacilityEndDate;
      existingUpdatedFields.facilityEndDate = amendment.tfm.facilityEndDate;
      existingUpdatedFields.bankReviewDate = amendment.tfm.bankReviewDate;
    }

    if (!amendmentTfmCoverEndDate && !hasFutureEffectiveDate) {
      amendmentTfmCoverEndDate = amendment.tfm.coverEndDate;
    }
    if (!amendmentCoverEndDate && !hasFutureEffectiveDate) {
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
        const valueInGBP = getGBPValue(exchangeRate, latestAmendmentTFM.value);
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
  calculateAmendmentTotalExposure,
  findLatestCompletedAmendment,
};
