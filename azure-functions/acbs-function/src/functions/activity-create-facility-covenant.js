/**
 * This function is an Azure Durable activity function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * @module create-facility-covenant
 */

const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const mdm = require('../../apim-mdm');
const CONSTANTS = require('../../constants');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = ['covenantIdentifier', 'covenantType', 'maximumLiability', 'currency', 'guaranteeExpiryDate', 'effectiveDate'];

df.app.activity('create-facility-covenant', {
  handler: async (payload) => {
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
  },
});
