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
  'amount',
  'effectiveDate',
  'expirationDate',
  'nextDueDate',
  'nextAccrueToDate',
  'period',
  'currency',
  'lenderTypeCode',
  'incomeClassCode',
  'spreadToInvestorsIndicator',
];

const createFacilityFee = async (context) => {
  const { acbsFacilityFeeInput } = context.bindingData;
  const missingMandatory = findMissingMandatory(acbsFacilityFeeInput, mandatoryFields);
  if (missingMandatory.length) {
    return Promise.resolve({ missingMandatory });
  }

  const submittedToACBS = moment().format();
  const { status, data } = await api.createFacilityFee(acbsFacilityFeeInput);

  if (isHttpErrorStatus(status)) {
    throw new Error(
      JSON.stringify({
        name: 'ACBS Facility fee record create error',
        facilityIdentifier: acbsFacilityFeeInput.facilityIdentifier,
        submittedToACBS,
        receivedFromACBS: moment().format(),
        dataReceived: data,
        dataSent: acbsFacilityFeeInput,
      }, null, 4),
    );
  }

  return {
    submittedToACBS,
    receivedFromACBS: moment().format(),
    ...data,
  };
};

module.exports = createFacilityFee;
