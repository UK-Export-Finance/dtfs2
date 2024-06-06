/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 */

/*
 * Facility loan amendment DAF
 * ***************************
 * This DAF (Durable Activity Function) is never invoked directly.
 * It is invoked via DOF (Durable Orchestrator Function).
 *
 * Pre-requisites
 * --------------
 * 0. 'npm install durable-functions'
 * 1. Durable  HTTP trigger function (acbs-http)
 * 2. Durable Orchestrator function (DOF) (acbs-amend-facility)
 *
 * ------------------
 * HTTP -> DOF -> DAF
 * ------------------
 */
const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = ['expiryDate'];

const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility loan amendment payload');
    }

    const { loanId, facilityId, acbsFacilityLoanInput } = payload;

    const missingMandatory = findMissingMandatory(acbsFacilityLoanInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();

    const { status, data } = await api.updateFacilityLoan(facilityId, loanId, acbsFacilityLoanInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility loan amend error',
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
    console.error('Unable to amend facility loan record %o', error);
    throw new Error(`Unable to amend facility loan record ${error}`);
  }
};

df.app.activity('update-facility-loan', {
  handler,
});
