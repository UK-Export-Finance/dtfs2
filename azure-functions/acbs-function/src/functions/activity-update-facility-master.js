/*
 * Facility master record update DAF
 * **********************************
 * This DAF (Durable Activity Function) is never invoked directly.
 * It is invoked via DOF (Durable Orchestrator Function).
 *
 * Pre-requisites
 * --------------
 * 0. 'npm install durable-functions'
 * 1. Durable  HTTP trigger function (acbs-http)
 * 2. Durable Orchestrator function (DOF) (acbs-issue-facility)
 *
 * ------------------
 * HTTP -> DOF -> DAF
 * ------------------
 */
const df = require('durable-functions');
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

/**
 * Handles the amendment of a facility master record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Checks for missing mandatory fields in the ACBS facility master input.
 * 3. Submits the amendment to the ACBS system.
 * 4. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The input payload containing the facility ID, ACBS facility master input, update type, and etag.
 * @param {string} payload.facilityId - The ID of the facility to be amended.
 * @param {Object} payload.acbsFacilityMasterInput - The ACBS facility master input details.
 * @param {string} payload.updateType - The type of update to be performed.
 * @param {string} payload.etag - The etag of the facility master record.
 * @returns {Object} - The result of the facility master record amendment, including status, timestamps, and data sent/received.
 * @throws {Error} - Throws an error if the input payload is invalid, if there are missing mandatory fields, or if there is an error during the amendment process.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility master amendment payload');
    }

    const { facilityId, acbsFacilityMasterInput, updateType, etag } = payload;
    const mandatoryFields = [
      'dealIdentifier',
      'facilityIdentifier',
      'dealBorrowerIdentifier',
      'maximumLiability',
      'productTypeId',
      'productTypeName',
      'currency',
      'guaranteeExpiryDate',
      'nextQuarterEndDate',
      'delegationType',
      'interestOrFeeRate',
      'facilityStageCode',
      'exposurePeriod',
      'creditRatingCode',
      'premiumFrequencyCode',
      'riskCountryCode',
      'riskStatusCode',
      'effectiveDate',
      'forecastPercentage',
      'agentBankIdentifier',
      'obligorPartyIdentifier',
      'obligorIndustryClassification',
    ];
    const missingMandatory = findMissingMandatory(acbsFacilityMasterInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacility(facilityId, updateType, acbsFacilityMasterInput, etag);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility update error',
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityMasterInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      updateType,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      dataSent: acbsFacilityMasterInput,
      ...data,
    };
  } catch (error) {
    console.error('Unable to amend facility master record %o', error);
    throw new Error(`Unable to amend facility master record ${error}`);
  }
};

df.app.activity('update-facility-master', {
  handler,
});
