/**
 * This function is an Azure Durable activity function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * @module create-deal
 */

const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = [
  'dealIdentifier',
  'currency',
  'dealValue',
  'guaranteeCommencementDate',
  'obligorPartyIdentifier',
  'obligorName',
  'obligorIndustryClassification',
];

df.app.activity('create-deal', {
  handler: async (payload) => {
    try {
      if (!payload) {
        throw new Error('Invalid deal master record payload');
      }

      const missingMandatory = findMissingMandatory(payload, mandatoryFields);

      if (missingMandatory.length) {
        return { missingMandatory };
      }

      const submittedToACBS = getNowAsIsoString();

      const { status, data } = await api.createDeal(payload);

      if (isHttpErrorStatus(status)) {
        throw new Error(
          JSON.stringify(
            {
              name: 'ACBS Deal create error',
              status,
              dealIdentifier: payload.dealIdentifier,
              submittedToACBS,
              receivedFromACBS: getNowAsIsoString(),
              dataReceived: data,
              dataSent: payload,
            },
            null,
            4,
          ),
        );
      }

      return {
        status,
        dataSent: payload,
        submittedToACBS,
        receivedFromACBS: getNowAsIsoString(),
        ...data,
      };
    } catch (error) {
      console.error('Unable to create deal master record %o', error);
      throw new Error(`Unable to create deal master record ${error}`);
    }
  },
});
