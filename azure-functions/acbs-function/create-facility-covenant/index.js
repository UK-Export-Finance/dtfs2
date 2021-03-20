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
const mdmEaApi = require('../api-ukef-mdm-ea');
const { isHttpErrorStatus } = require('../helpers/http');
const { findMissingMandatory } = require('../helpers/mandatoryFields');

const mandatoryFields = [
  'facilityIdentifier',
  'covenantIdentifier',
  'covenantType',
  'maximumLiability',
  'currency',
  'guaranteeCommencementDate',
  'guaranteeExpiryDate',
  'effectiveDate',
];

const createFacilityCovenant = async (context) => {
  const { acbsFacilityCovenantInput } = context.bindingData;

  const covenantReq = await api.createFacilityCovenantId({
    numberTypeId: 8,
    createdBy: 'Portal v2/TFM',
    requestingSystem: 'Portal v2/TFM',
  });

  if (covenantReq.status === 201) {
    acbsFacilityCovenantInput.covenantIdentifier = covenantReq.data.id;
  }

  // Replace ISO currency with ACBS currency code
  const currencyReq = await mdmEaApi.getCurrency(acbsFacilityCovenantInput.currency);
  acbsFacilityCovenantInput.currency = currencyReq.status === 200 ? currencyReq.data[0].acbsCode : '';

  const missingMandatory = findMissingMandatory(acbsFacilityCovenantInput, mandatoryFields);

  if (missingMandatory.length) {
    return Promise.resolve({ missingMandatory });
  }

  const submittedToACBS = moment().format();
  const { status, data } = await api.createFacilityCovenant(acbsFacilityCovenantInput);
  if (isHttpErrorStatus(status)) {
    throw new Error(`
      ACBS Facility covenant create error. 
      dealIdentifier: ${acbsFacilityCovenantInput.dealIdentifier}, 
      submittedToACBS: ${submittedToACBS}, 
      receivedFromACBS: ${moment().format()}, 
      dataReceived: ${JSON.stringify(data, null, 4)}
      dataSent: ${JSON.stringify(acbsFacilityCovenantInput, null, 4)}
     `);
  }

  return {
    submittedToACBS,
    receivedFromACBS: moment().format(),
    ...data,
  };
};

module.exports = createFacilityCovenant;
