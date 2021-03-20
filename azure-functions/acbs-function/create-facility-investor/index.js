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
  'facilityIdentifier',
  'guaranteeCommencementDate',
  'guaranteeExpiryDate',
  'effectiveDate',
  'currency',
  'maximumLiability',
];

const createFacilityInvestor = async (context) => {
  const { acbsFacilityInvestorInput } = context.bindingData;

  const missingMandatory = findMissingMandatory(acbsFacilityInvestorInput, mandatoryFields);

  if (missingMandatory.length) {
    return Promise.resolve({ missingMandatory });
  }

  const submittedToACBS = moment().format();

  const { status, data } = await api.createFacilityInvestor(acbsFacilityInvestorInput);

  if (isHttpErrorStatus(status)) {
    throw new Error(`
      ACBS Facility Investor create error. 
      dealIdentifier: ${acbsFacilityInvestorInput.dealIdentifier}, 
      submittedToACBS: ${submittedToACBS}, 
      receivedFromACBS: ${moment().format()}, 
      dataReceived: ${JSON.stringify(data, null, 4)}
      dataSent: ${JSON.stringify(acbsFacilityInvestorInput, null, 4)}
     `);
  }

  return {
    submittedToACBS,
    receivedFromACBS: moment().format(),
    ...data,
  };
};

module.exports = createFacilityInvestor;
