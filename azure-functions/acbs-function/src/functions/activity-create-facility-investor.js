const df = require('durable-functions');
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

/**
 * Handles the creation of a facility loan record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Checks for missing mandatory fields in the ACBS facility loan input.
 * 3. Submits the creation request to the ACBS system.
 * 4. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The input payload containing the facility identifier and ACBS facility loan input.
 * @param {string} payload.facilityIdentifier - The identifier of the facility.
 * @param {Object} payload.acbsFacilityLoanInput - The ACBS facility loan input details.
 * @returns {Object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API, or an object with the missing mandatory fields.
 * @throws {Error} - Throws an error if the payload is invalid, if there are missing mandatory fields, if the API request fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility investor record payload');
    }

    const { facilityIdentifier, acbsFacilityInvestorInput } = payload;
    const mandatoryFields = ['maximumLiability', 'currency', 'guaranteeExpiryDate', 'effectiveDate'];
    const missingMandatory = findMissingMandatory(acbsFacilityInvestorInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();

    const { status, data } = await api.createFacilityInvestor(facilityIdentifier, acbsFacilityInvestorInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility investor create error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityInvestorInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: acbsFacilityInvestorInput,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility investor record %o', error);
    throw new Error(`Unable to create facility investor record ${error}`);
  }
};

df.app.activity('create-facility-investor', {
  handler,
});
