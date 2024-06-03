/**
 * This function is an Azure Durable Function activity named 'get-acbs-industry-sector'.
 * It is designed to fetch the ACBS industry sector code for a given industry.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * @module create-deal-investor
 */

const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = ['effectiveDate', 'currency'];

df.app.activity('create-deal-investor', {
  handler: async (payload) => {
    try {
      if (!payload) {
        throw new Error('Invalid deal investor record payload');
      }

      const { dealIdentifier, investor } = payload;

      const missingMandatory = findMissingMandatory(investor, mandatoryFields);

      if (missingMandatory.length) {
        return { missingMandatory };
      }

      const submittedToACBS = getNowAsIsoString();

      const { status, data } = await api.createDealInvestor(dealIdentifier, investor);

      if (isHttpErrorStatus(status)) {
        throw new Error(
          JSON.stringify(
            {
              name: 'ACBS Deal Investor create error',
              status,
              dealIdentifier,
              submittedToACBS,
              receivedFromACBS: getNowAsIsoString(),
              dataReceived: data,
              dataSent: investor,
            },
            null,
            4,
          ),
        );
      }

      return {
        status,
        dataSent: investor,
        submittedToACBS,
        receivedFromACBS: getNowAsIsoString(),
        ...data,
      };
    } catch (error) {
      console.error('Unable to create deal investor record %o', error);
      throw new Error(`Unable to create deal investor record ${error}`);
    }
  },
});
