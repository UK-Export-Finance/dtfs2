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
const api = require('../api');
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

const createDeal = (context) => {
  const { deal } = context.bindingData;

  const missingMandatory = findMissingMandatory(deal, mandatoryFields);

  if (missingMandatory.length) {
    return Promise.resolve({ missingMandatory });
  }

  return api.createDeal(deal);
};

module.exports = createDeal;
