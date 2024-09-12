/*
 * Facility guarantee amendment DAF
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
 * This function is used to update the guarantee of a facility. It first checks if the payload is valid and contains all mandatory fields.
 * If the payload is valid, it sends a request to the API to update the facility guarantee.
 * If the API request is successful, it returns an object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * If the API request fails, it throws an error with details about the request and the error.
 * If the payload is not valid or does not contain all mandatory fields, it returns an object with the missing mandatory fields.
 * If any other error occurs, it logs the error and throws a new error.
 *
 * @param {object} payload - The payload containing the facilityIdentifier and acbsFacilityGuaranteeInput.
 * @param {string} payload.facilityIdentifier - The identifier of the facility.
 * @param {object} payload.acbsFacilityGuaranteeInput - The acbsFacilityGuaranteeInput object containing the guarantee details.
 * @returns {object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * @throws {Error} - Throws an error if the payload is invalid, if the API request to generate the guarantee ID fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility guarantee update payload');
    }

    const { facilityIdentifier, acbsFacilityGuaranteeInput } = payload;

    // Call create guarantee API
    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacilityGuarantee(facilityIdentifier, acbsFacilityGuaranteeInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Guarantee amend error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityGuaranteeInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      dataSent: acbsFacilityGuaranteeInput,
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility guarantee record %o', error);
    throw new Error(`Unable to create facility guarantee record ${error}`);
  }
};

df.app.activity('update-facility-guarantee', {
  handler,
});
