/**
 * This function is an Azure Durable activity function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * @module create-deal-guarantee
 */

const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = ['effectiveDate', 'limitKey', 'guaranteeExpiryDate', 'maximumLiability', 'guarantorParty'];

df.app.activity('create-deal-guarantee', {
  handler: async (payload) => {
    try {
      if (!payload) {
        throw new Error('Invalid deal guarantee record payload');
      }

      const { dealIdentifier, guarantee } = payload;

      const missingMandatory = findMissingMandatory(guarantee, mandatoryFields);

      if (missingMandatory.length) {
        return { missingMandatory };
      }

      const submittedToACBS = getNowAsIsoString();

      const { status, data } = await api.createDealGuarantee(dealIdentifier, guarantee);

      if (isHttpErrorStatus(status)) {
        throw new Error(
          JSON.stringify(
            {
              name: 'ACBS Deal Guarantee create error',
              status,
              dealIdentifier,
              submittedToACBS,
              receivedFromACBS: getNowAsIsoString(),
              dataReceived: data,
              dataSent: guarantee,
            },
            null,
            4,
          ),
        );
      }

      return {
        status,
        dataSent: guarantee,
        submittedToACBS,
        receivedFromACBS: getNowAsIsoString(),
        ...data,
      };
    } catch (error) {
      console.error('Unable to create deal guarantee record %o', error);
      throw new Error(`Unable to create deal guarantee record ${error}`);
    }
  },
});
