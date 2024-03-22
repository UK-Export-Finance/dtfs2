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
const { getNowAsIsoString } = require('../helpers/date');
const api = require('../api');
const { isHttpErrorStatus } = require('../helpers/http');
const { findMissingMandatory } = require('../helpers/mandatoryFields');

const mandatoryFields = [
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
  try {
    const { facilityIdentifier, acbsFacilityFeeInput } = context.bindingData;

    const missingMandatory = findMissingMandatory(acbsFacilityFeeInput, mandatoryFields);
    if (missingMandatory.length) {
      return Promise.resolve({ missingMandatory });
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.createFacilityFee(facilityIdentifier, acbsFacilityFeeInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility fee record create error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityFeeInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: acbsFacilityFeeInput,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility fee record. %o', error);
    throw new Error('Unable to create facility fee record', { cause: error });
  }
};

module.exports = createFacilityFee;
