const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const mdm = require('../../apim-mdm');
const CONSTANTS = require('../../constants');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = ['covenantIdentifier', 'covenantType', 'maximumLiability', 'currency', 'guaranteeExpiryDate', 'effectiveDate'];

/**
 * This function is used to create a facility covenant record. It first checks if the payload is valid.
 * If the payload is valid, it generates a covenant ID using the number generator and replaces the ISO currency with the ACBS currency code.
 * It then checks for missing mandatory fields in the acbsFacilityCovenantInput object.
 * If the payload is not valid, it throws an error.
 * If the API request to generate the covenant ID fails, it throws an error with details about the request and the error.
 * If the API request to get the ACBS currency code fails, it defaults the currency code to GBP.
 *
 * @param {object} payload - The payload containing the facilityIdentifier and acbsFacilityCovenantInput.
 * @param {string} payload.facilityIdentifier - The identifier of the facility.
 * @param {object} payload.acbsFacilityCovenantInput - The acbsFacilityCovenantInput object containing the covenant details.
 * @throws {Error} - Throws an error if the payload is invalid, if the API request to generate the covenant ID fails, or if any other error occurs.
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
