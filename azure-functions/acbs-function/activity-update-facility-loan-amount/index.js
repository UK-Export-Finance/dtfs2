/*
 * Facility loan `amount` amendment DAF
 * **********************************
 * This DAF (Durable Activity Function) is never invoked directly.
 * It is invoked via DOF (Durable Orchestrator Function).
 *
 * Pre-requisites
 * --------------
 * 0. 'npm install durable-functions'
 * 1. Durable  HTTP starter function (acbs-http)
 * 2. Durable Orchestrator function (DOF) (acbs-amend-facility)
 *
 * ------------------
 * HTTP -> DOF -> DAF
 * ------------------
 */
const df = require('durable-functions');
const { getNowAsIsoString } = require('../helpers/date');
const api = require('../api');
const { isHttpErrorStatus } = require('../helpers/http');
const { findMissingMandatory } = require('../helpers/mandatoryFields');

const mandatoryFields = ['effectiveDate', 'amountAmendment'];

const updateFacilityLoanAmount = async (context) => {
  try {
    const { loanId, facilityId, acbsFacilityLoanInput } = context.bindingData;

    const missingMandatory = findMissingMandatory(acbsFacilityLoanInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();

    const { status, data } = await api.updateFacilityLoanAmount(facilityId, loanId, acbsFacilityLoanInput);
    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility loan amount amend error',
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
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      dataSent: acbsFacilityLoanInput,
      ...data,
    };
  } catch (error) {
    console.error('Error amending facility loan amount: %o', error);
    throw new Error(`Error amending facility loan amount ${error}`);
  }
};

df.app.activity('update-facility-loan-amount', {
  handler: updateFacilityLoanAmount,
});
