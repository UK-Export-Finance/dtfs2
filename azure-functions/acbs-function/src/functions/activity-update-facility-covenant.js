/*
 * Facility covenant amendment DAF
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
 * This function is used to update the covenant of a facility. It first checks if the payload is valid and contains all mandatory fields.
 * If the payload is valid, it sends a request to the API to update the facility covenant.
 * If the API request is successful, it returns an object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * If the API request fails, it throws an error with details about the request and the error.
 * If the payload is not valid or does not contain all mandatory fields, it returns an object with the missing mandatory fields.
 * If any other error occurs, it logs the error and throws a new error.
 *
 * @param {object} payload - The payload containing the facilityIdentifier and acbsFacilityCovenantInput.
 * @param {string} payload.facilityIdentifier - The identifier of the facility.
 * @param {import('../../mappings/facility/facility-covenant-amend').MappedFacilityCovenantAmendment} payload.acbsFacilityCovenantInput - The acbsFacilityCovenantInput object containing the covenant details.
 * @returns {object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * @throws {Error} - Throws an error if the payload is invalid, if the API request to generate the covenant ID fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility covenant amendment payload');
    }

    const { facilityIdentifier, acbsFacilityCovenantInput } = payload;

    // As both fields on the payload are optional,
    // we need to check if the payload is not empty
    if (Object.keys(acbsFacilityCovenantInput).length === 0) {
      throw new Error('Invalid facility covenant update payload');
    }

    // Call update covenant API
    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacilityCovenant(facilityIdentifier, acbsFacilityCovenantInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Covenant amend error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityCovenantInput,
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
      dataSent: acbsFacilityCovenantInput,
      ...data,
    };
  } catch (error) {
    console.error('Unable to amend facility convenant record %o', error);
    throw new Error(`Unable to amend facility convenant record ${error}`);
  }
};

df.app.activity('update-facility-covenant', {
  handler,
});
