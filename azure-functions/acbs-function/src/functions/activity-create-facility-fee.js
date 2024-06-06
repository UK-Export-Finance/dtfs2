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

const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility fixed fee record payload');
    }

    const { facilityIdentifier, acbsFacilityFeeInput } = payload;

    const missingMandatory = findMissingMandatory(acbsFacilityFeeInput, mandatoryFields);
    if (missingMandatory.length) {
      return { missingMandatory };
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
    console.error('Unable to create facility fixed fee record %o', error);
    throw new Error(`Unable to create facility fixed fee record ${error}`);
  }
};

df.app.activity('create-facility-fee', {
  handler,
});
