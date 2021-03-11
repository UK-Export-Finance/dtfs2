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
  'alternateIdentifier',
  'industryClassification',
  'name1',
  'smeType',
  'citizenshipClass',
  'officerRiskDate',
  'countryCode',
];

const createParty = (context) => {
  const { party } = context.bindingData;

  const missingMandatory = findMissingMandatory(party, mandatoryFields);

  if (missingMandatory.length) {
    return Promise.resolve({ missingMandatory });
  }
  return api.createParty(party);
};

module.exports = createParty;
