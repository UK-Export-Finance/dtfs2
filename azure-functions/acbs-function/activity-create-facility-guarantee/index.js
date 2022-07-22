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
  'guarantorParty',
  'limitKey',
  'guaranteeExpiryDate',
  'effectiveDate',
  'maximumLiability',
  'guaranteeTypeCode',
];
const createFacilityGuarantee = async (context) => {
  const { acbsFacilityGuaranteeInput } = context.bindingData;

  const missingMandatory = findMissingMandatory(acbsFacilityGuaranteeInput, mandatoryFields);

  if (missingMandatory.length) {
    return Promise.resolve({ missingMandatory });
  }

  const submittedToACBS = moment().format();
  const { status, data } = await api.createFacilityGuarantee(acbsFacilityGuaranteeInput);

  if (isHttpErrorStatus(status)) {
    throw new Error(
      JSON.stringify({
        name: 'ACBS Facility Guarantee create error',
        dealIdentifier: acbsFacilityGuaranteeInput.dealIdentifier,
        submittedToACBS,
        receivedFromACBS: moment().format(),
        dataReceived: data,
        dataSent: acbsFacilityGuaranteeInput,
      }, null, 4),
    );
  }

  return {
    status,
    dataSent: acbsFacilityGuaranteeInput,
    submittedToACBS,
    receivedFromACBS: moment().format(),
    ...data,
  };
};

module.exports = createFacilityGuarantee;
