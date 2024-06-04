/**
 * This function is an Azure Durable activity function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * @module create-party
 */

const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = ['alternateIdentifier', 'industryClassification', 'name1', 'smeType', 'citizenshipClass', 'officerRiskDate', 'countryCode'];

/**
 * Asynchronous handler function for creating a party record.
 *
 * @param {Object} party - The party object to be created.
 * @returns {Object} - Returns an object with the status of the operation and relevant data.
 * @throws {Error} - Throws an error if there is a failure in creating the party record.
 */
df.app.activity('create-party', {
  handler: async (party) => {
    try {
      if (!party) {
        return {};
      }

      const missingMandatory = findMissingMandatory(party, mandatoryFields);

      if (missingMandatory.length) {
        return { missingMandatory };
      }

      const submittedToACBS = getNowAsIsoString();
      const { status, data } = await api.createParty(party);

      if (isHttpErrorStatus(status)) {
        throw new Error(
          JSON.stringify(
            {
              name: 'ACBS Party create error',
              status,
              UKEF_ID: party.alternateIdentifier,
              submittedToACBS,
              receivedFromACBS: getNowAsIsoString(),
              dataReceived: data,
              dataSent: party,
            },
            null,
            4,
          ),
        );
      }

      return {
        status,
        dataSent: party,
        submittedToACBS,
        receivedFromACBS: getNowAsIsoString(),
        ...data,
      };
    } catch (error) {
      console.error('Unable to create party record %o', error);
      throw new Error(`Unable to create party record ${error}`);
    }
  },
});
