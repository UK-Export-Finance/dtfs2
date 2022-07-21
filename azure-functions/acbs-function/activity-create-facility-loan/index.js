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
  'portfolioIdentifier',
  'postingDate',
  'facilityIdentifier',
  'borrowerPartyIdentifier',
  'productTypeId',
  'productTypeGroup',
  'currency',
  'amount',
  'issueDate',
  'expiryDate',
  'spreadRate',
  'nextDueDate',
  'yearBasis',
  'loanBillingFrequencyType',
];

const createFacilityLoan = async (context) => {
  try {
    const { acbsFacilityLoanInput } = context.bindingData;
    const missingMandatory = findMissingMandatory(acbsFacilityLoanInput, mandatoryFields);

    if (missingMandatory.length) {
      return Promise.resolve({ missingMandatory });
    }

    const submittedToACBS = moment().format();
    const { status, data } = await api.createFacilityLoan(acbsFacilityLoanInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify({
          name: 'ACBS Facility loan record create error',
          facilityIdentifier: acbsFacilityLoanInput.facilityIdentifier,
          submittedToACBS,
          receivedFromACBS: moment().format(),
          dataReceived: data,
          dataSent: acbsFacilityLoanInput,
        }, null, 4),
      );
    }

    return {
      status,
      dataSent: acbsFacilityLoanInput,
      submittedToACBS,
      receivedFromACBS: moment().format(),
      ...data,
    };
  } catch (e) {
    console.error('Unable to create facility loan.', { e });
    return e;
  }
};

module.exports = createFacilityLoan;
