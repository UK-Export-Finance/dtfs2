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
const { isHttpErrorStatus } = require('../helpers/http');
const { findMissingMandatory } = require('../helpers/mandatoryFields');

const mandatoryFields = ['effectiveDate', 'currency'];

const createDealInvestor = async (context) => {
  try {
    const { dealIdentifier, investor } = context.bindingData;

    const missingMandatory = findMissingMandatory(investor, mandatoryFields);

    if (missingMandatory.length) {
      return Promise.resolve({ missingMandatory });
    }

    const submittedToACBS = moment().format();

    const { status, data } = await api.createDealInvestor(dealIdentifier, investor);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Deal Investor create error',
            status,
            dealIdentifier,
            submittedToACBS,
            receivedFromACBS: moment().format(),
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
      receivedFromACBS: moment().format(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create deal investor record. %O', error);
    throw new Error('Unable to create deal investor record %O', error);
  }
};

module.exports = createDealInvestor;
