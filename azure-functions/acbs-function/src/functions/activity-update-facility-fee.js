/*
 * Facility fee amendment DAF
 * ***************************
 * This DAF (Durable Activity Function) is never invoked directly.
 * It is invoked via DOF (Durable Orchestrator Function).
 *
 * Pre-requisites
 * --------------
 * 0. 'npm install durable-functions'
 * 1. Durable  HTTP trigger function (acbs-http)
 * 2. Durable Orchestrator function (DOF) (acbs-amend-facility)
 *
 * ------------------
 * HTTP -> DOF -> DAF
 * ------------------
 */
const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');

/**
 * This function is used to update the fee of a facility. It first checks if the payload is valid and contains all mandatory fields.
 * If the payload is valid, it sends a request to the API to update the facility fee.
 * If the API request is successful, it returns an object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * If the API request fails, it throws an error with details about the request and the error.
 * If the payload is not valid or does not contain all mandatory fields, it returns an object with the missing mandatory fields.
 * If any other error occurs, it logs the error and throws a new error.
 *
 * @param {Object} payload - The payload containing the facilityIdentifier and acbsFacilityFeeInput.
 * @param {string} payload.facilityIdentifier - The identifier of the facility.
 * @param {Object} payload.acbsFacilityFeeInput - The acbsFacilityFeeInput object containing the fee details.
 * @returns {Object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * @throws {Error} - Throws an error if the payload is invalid, if the API request to generate the fee ID fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility fee update payload');
    }

    const { facilityIdentifier, acbsFacilityFeeInput } = payload;

    // Call create fee API
    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacilityFee(facilityIdentifier, acbsFacilityFeeInput);

    // Throw error upon an unsuccessful response
    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Fee amend error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityFeeInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: acbsFacilityFeeInput,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility fee record %o', error);
    throw new Error(`Unable to create facility fee record ${error}`);
  }
};

df.app.activity('update-facility-fee', {
  handler,
});
