const { calculateGefFacilityFeeRecord } = require('@ukef/dtfs2-common');
const api = require('../api');
const convertFacilityCurrency = require('./convert-facility-currency');
const getFacilityExposurePeriod = require('./get-facility-exposure-period');
const DEFAULTS = require('../defaults');
const getGuaranteeDates = require('../helpers/get-guarantee-dates');
const getFacilityPremiumSchedule = require('./get-facility-premium-schedule');
const CONSTANTS = require('../../constants');

const SUBMISSION_STEP_TIMEOUT_MS = Number(process.env.TFM_SUBMIT_STEP_TIMEOUT_MS || 10000);

/**
 * Wraps a promise with a timeout.
 * @param {*} promise The promise to wrap
 * @param {*} timeoutMs The timeout in milliseconds
 * @param {*} operation The name of the operation for logging
 * @param {*} facilityId The facility ID for logging
 * @returns The result of the promise or throws an error if timed out
 */
const withTimeout = async (promise, timeoutMs, operation, facilityId) => {
  let timeoutId;

  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } catch (error) {
    console.error('updateFacilities: %s failed for facility %s %o', operation, facilityId, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const updateFacilities = async (deal, auditDetails) => {
  /**
   * Create deep clone
   * Note this has the side effect of converting dates to strings
   */
  const modifiedDeal = JSON.parse(JSON.stringify(deal));

  const { dealType, submissionDate: dealSubmissionDate, submissionType } = modifiedDeal;

  modifiedDeal.facilities = await Promise.all(
    modifiedDeal.facilities.map(async (f) => {
      const facility = f;

      const { _id: facilityId, hasBeenIssued } = facility;

      let facilityUpdate;
      let facilityPremiumSchedule;
      let feeRecord;

      /**
       * If facility hasBeenIssued
       * Check if gef or bss
       * Adds hasBeenIssuedAndAcknowledged and/or hasBeenAcknowledged parameter
       * Updates the facility collection with flags and tfm facilities collection
       */
      if (hasBeenIssued) {
        const portalFacilityUpdate = {
          hasBeenIssuedAndAcknowledged: true,
        };

        if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
          // only changes flag if AIN or MIA
          if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
            // updates GEF facility collection
            const updatedPortalFacility = await api.updateGefFacility({ facilityId, facilityUpdate: portalFacilityUpdate, auditDetails });

            facility.hasBeenIssuedAndAcknowledged = updatedPortalFacility.hasBeenIssuedAndAcknowledged;
          }
        } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
          const facilityStatusUpdate = CONSTANTS.FACILITIES.FACILITY_STATUS_PORTAL.ACKNOWLEDGED;

          await withTimeout(
            api.updatePortalFacilityStatus(facilityId, facilityStatusUpdate, auditDetails),
            SUBMISSION_STEP_TIMEOUT_MS,
            'updatePortalFacilityStatus',
            facilityId,
          );

          portalFacilityUpdate.hasBeenAcknowledged = true;

          // updates BSS facility collection
          const updatedPortalFacility = await withTimeout(
            api.updatePortalFacility(facilityId, portalFacilityUpdate, auditDetails),
            SUBMISSION_STEP_TIMEOUT_MS,
            'updatePortalFacility',
            facilityId,
          );

          facility.hasBeenAcknowledged = updatedPortalFacility.hasBeenAcknowledged;
          facility.hasBeenIssuedAndAcknowledged = updatedPortalFacility.hasBeenIssuedAndAcknowledged;
          facility.status = facilityStatusUpdate;
        }

        facilityUpdate = {
          ...facilityUpdate,
          ...portalFacilityUpdate,
        };
      }

      const facilityGuaranteeDates = getGuaranteeDates(facility, dealSubmissionDate);
      const facilityCurrencyConversion = await withTimeout(
        convertFacilityCurrency(facility, dealSubmissionDate),
        SUBMISSION_STEP_TIMEOUT_MS,
        'convertFacilityCurrency',
        facilityId,
      );

      try {
        const facilityExposurePeriod = await withTimeout(
          getFacilityExposurePeriod(facility),
          SUBMISSION_STEP_TIMEOUT_MS,
          'getFacilityExposurePeriod',
          facilityId,
        );

        // Premium Schedule is only valid for non-GEF facilities
        if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
          facilityPremiumSchedule = await withTimeout(
            getFacilityPremiumSchedule(facility, facilityExposurePeriod, facilityGuaranteeDates),
            SUBMISSION_STEP_TIMEOUT_MS,
            'getFacilityPremiumSchedule',
            facilityId,
          );
          facilityUpdate = {
            premiumSchedule: facilityPremiumSchedule,
          };
        } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
          // Fee record is only valid for GEF facilities
          if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
            feeRecord = calculateGefFacilityFeeRecord(facility);

            facilityUpdate = {
              ...facilityUpdate,
              feeRecord,
            };
          }
        }

        facilityUpdate = {
          ...facilityUpdate,
          ...facilityCurrencyConversion,
          ...facilityExposurePeriod,
          facilityGuaranteeDates,
          riskProfile: DEFAULTS.FACILITY_RISK_PROFILE,
        };

        const updateFacilityResponse = await withTimeout(
          api.updateFacility({
            facilityId,
            tfmUpdate: facilityUpdate,
            auditDetails,
          }),
          SUBMISSION_STEP_TIMEOUT_MS,
          'updateFacility',
          facilityId,
        );

        // add the updated tfm object to returned facility.
        // if we return updateFacilityResponse, we'll get facilitySnapshot
        // - therefore losing the flat, generic facility mapping used in deal submission calls.
        facility.tfm = updateFacilityResponse.tfm;

        return facility;
      } catch (error) {
        console.error('TFM-API - error in update-facilities.js %o', error);
        return facility;
      }
    }),
  );

  return modifiedDeal;
};

exports.updateFacilities = updateFacilities;
