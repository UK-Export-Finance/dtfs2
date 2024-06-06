/**
 * This function is an Azure Durable activity function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 */

const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = [
  'postingDate',
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

const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility loan record payload');
    }

    const { facilityIdentifier, acbsFacilityLoanInput } = payload;

    const missingMandatory = findMissingMandatory(acbsFacilityLoanInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.createFacilityLoan(facilityIdentifier, acbsFacilityLoanInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility loan record create error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityLoanInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: acbsFacilityLoanInput,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility loan record %o', error);
    throw new Error(`Unable to create facility loan record ${error}`);
  }
};

df.app.activity('create-facility-loan', {
  handler,
});
