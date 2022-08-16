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

const moment = require('moment');
const api = require('../api');
const { isHttpErrorStatus } = require('../helpers/http');
const { findMissingMandatory } = require('../helpers/mandatoryFields');

const mandatoryFields = [
  'portfolioIdentifier',
  'effectiveDate',
  'amountAmendment',
];

const updateFacilityLoanAmount = async (context) => {
  try {
    const {
      loanId,
      facilityId,
      acbsFacilityLoanInput,
    } = context.bindingData;

    const missingMandatory = findMissingMandatory(acbsFacilityLoanInput, mandatoryFields);

    if (missingMandatory.length) {
      return Promise.resolve({ missingMandatory });
    }

    const submittedToACBS = moment().format();

    const { status, data } = await api.updateFacilityLoanAmount(facilityId, loanId, acbsFacilityLoanInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify({
          name: 'ACBS Facility loan amount amend error',
          submittedToACBS,
          receivedFromACBS: moment().format(),
          dataReceived: data,
          dataSent: acbsFacilityLoanInput,
        }, null, 4),
      );
    }

    return {
      status,
      submittedToACBS,
      receivedFromACBS: moment().format(),
      dataSent: acbsFacilityLoanInput,
      ...data,
    };
  } catch (e) {
    console.error('Error amending facility loan amount: ', { e });
    throw new Error(e);
  }
};

module.exports = updateFacilityLoanAmount;
