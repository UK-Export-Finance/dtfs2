/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 *
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 *  * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */
const moment = require('moment');
const api = require('../api');
const mdm = require('../apim-mdm');
const CONSTANTS = require('../constants');
const { isHttpErrorStatus } = require('../helpers/http');
const { findMissingMandatory } = require('../helpers/mandatoryFields');

const mandatoryFields = ['covenantIdentifier', 'covenantType', 'maximumLiability', 'currency', 'guaranteeExpiryDate', 'effectiveDate'];

const createFacilityCovenant = async (context) => {
  try {
    const { facilityIdentifier, acbsFacilityCovenantInput } = context.bindingData;
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
            name: 'ACBS Facility Covenant create error',
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
    acbsFacilityCovenantInput.currency = currencyReq.status === 200 && currencyReq.data.length > 1
      ? currencyReq.data[0].acbsCode
      : CONSTANTS.FACILITY.ACBS_CURRENCY_CODE.DEFAULT;

    // Check for mandatory fields
    const missingMandatory = findMissingMandatory(acbsFacilityCovenantInput, mandatoryFields);

    if (missingMandatory.length) {
      return Promise.resolve({ missingMandatory });
    }

    // Call create covenant API
    const submittedToACBS = moment().format();
    const { status, data } = await api.createFacilityCovenant(facilityIdentifier, acbsFacilityCovenantInput);

    // Throw error upon an unsuccessful response
    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Covenant create error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: moment().format(),
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
      receivedFromACBS: moment().format(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility covenant record. %o', error);
    throw new Error('Unable to create facility covenant record %o', error);
  }
};

module.exports = createFacilityCovenant;
