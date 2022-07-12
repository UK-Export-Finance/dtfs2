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

const mandatoryFields = [
  'dealIdentifier',
  'currency',
  'dealValue',
  'guaranteeCommencementDate',
  'obligorPartyIdentifier',
  'obligorName',
  'obligorIndustryClassification',
];

const createDeal = async (context) => {
  const { deal } = context.bindingData;

  const missingMandatory = findMissingMandatory(deal, mandatoryFields);

  if (missingMandatory.length) {
    return Promise.resolve({ missingMandatory });
  }

  const submittedToACBS = moment().format();

  const { status, data } = await api.createDeal(deal);

  if (isHttpErrorStatus(status)) {
    throw new Error(JSON.stringify({
      name: 'ACBS Deal create error',
      status,
      dealIdentifier: deal.dealIdentifier,
      submittedToACBS,
      receivedFromACBS: moment().format(),
      dataReceived: data,
      dataSent: deal,
    }, null, 4));
  }

  return {
    submittedToACBS,
    receivedFromACBS: moment().format(),
    ...data,
  };
};

module.exports = createDeal;
