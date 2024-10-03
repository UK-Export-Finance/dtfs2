const df = require('durable-functions');
const api = require('../../api');
const mdm = require('../../apim-mdm');
const CONSTANTS = require('../../constants');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

/**
 * Handles the creation of a facility covenant record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Generates a covenant ID using the number generator.
 * 3. Replaces the ISO currency code with the ACBS currency code.
 * 4. Checks for missing mandatory fields in the ACBS facility covenant input.
 * 5. Submits the creation request to the ACBS system.
 * 6. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The input payload containing the facility identifier and ACBS facility covenant input.
 * @param {string} payload.facilityIdentifier - The identifier of the facility.
 * @param {Object} payload.acbsFacilityCovenantInput - The ACBS facility covenant input details.
 * @returns {Object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API, or an object with the missing mandatory fields.
 * @throws {Error} - Throws an error if the payload is invalid, if the API request fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility convenant record payload');
    }

    const { facilityIdentifier, acbsFacilityCovenantInput } = payload;
    const { currency } = acbsFacilityCovenantInput;

    // Get covenant ID from the number generator
    const covenantIdPayload = {
      numberTypeId: CONSTANTS.FACILITY.NUMBER_GENERATOR_PAYLOAD.COVENANT.TYPE,
      createdBy: CONSTANTS.FACILITY.NUMBER_GENERATOR_PAYLOAD.COVENANT.USER,
      requestingSystem: CONSTANTS.FACILITY.NUMBER_GENERATOR_PAYLOAD.COVENANT.USER,
    };

    const { status: covenantStatus, data: covenantData } = await api.createFacilityCovenantId(covenantIdPayload);

    if (covenantStatus === 201 && Array.isArray(covenantData)) {
      acbsFacilityCovenantInput.covenantIdentifier = covenantData[0].maskedId;
    }

    // Throw error upon an unsuccessful response
    if (isHttpErrorStatus(covenantStatus)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility covenant create error',
            facilityIdentifier,
            dataReceived: covenantData,
            dataSent: covenantIdPayload,
          },
          null,
          4,
        ),
      );
    }

    // Replace ISO currency with ACBS currency code
    const currencyReq = await mdm.getCurrency(currency);

    // Default currency code to GBP (O)
    acbsFacilityCovenantInput.currency =
      currencyReq.status === 200 && currencyReq.data.length > 1 ? currencyReq.data[0].acbsCode : CONSTANTS.FACILITY.ACBS_CURRENCY_CODE.DEFAULT;

    // Check for mandatory fields
    const mandatoryFields = ['covenantIdentifier', 'covenantType', 'maximumLiability', 'currency', 'guaranteeExpiryDate', 'effectiveDate'];
    const missingMandatory = findMissingMandatory(acbsFacilityCovenantInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    // Call create covenant API
    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.createFacilityCovenant(facilityIdentifier, acbsFacilityCovenantInput);

    // Throw error upon an unsuccessful response
    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Covenant create error',
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
      dataSent: acbsFacilityCovenantInput,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility convenant record %o', error);
    throw new Error(`Unable to create facility convenant record ${error}`);
  }
};

df.app.activity('create-facility-covenant', {
  handler,
});
