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
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

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

/**
 * This function is used to update a facility. It first checks if the payload is valid and contains all mandatory fields.
 * If the payload is valid, it sends a request to the API to update the facility.
 * If the API request is successful, it returns an object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * If the API request fails, it throws an error with details about the request and the error.
 * If the payload is not valid or does not contain all mandatory fields, it returns an object with the missing mandatory fields.
 * If any other error occurs, it logs the error and throws a new error.
 *
 * @param {object} payload - The payload containing the facilityIdentifier, acbsFacilityMasterInput, updateType, and etag.
 * @param {string} payload.facilityIdentifier - The ID of the facility.
 * @param {object} payload.acbsFacilityMasterInput - The input for the ACBS facility master, containing the mandatory fields.
 * @param {string} payload.updateType - The type of update to be performed.
 * @param {string} payload.etag - The etag of the facility.
 * @returns {object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * @throws {Error} - Throws an error if the payload is invalid, if the API request fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility master amendment payload');
    }

    const { facilityIdentifier, acbsFacilityMasterInput, updateType, etag } = payload;

    const missingMandatory = findMissingMandatory(acbsFacilityMasterInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacility(facilityIdentifier, updateType, acbsFacilityMasterInput, etag);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility master amend error',
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
