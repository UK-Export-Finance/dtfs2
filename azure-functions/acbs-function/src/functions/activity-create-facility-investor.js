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

const mandatoryFields = ['maximumLiability', 'currency', 'guaranteeExpiryDate', 'effectiveDate'];

const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility investor record payload');
    }

    const { facilityIdentifier, acbsFacilityInvestorInput } = payload;

    const missingMandatory = findMissingMandatory(acbsFacilityInvestorInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();

    const { status, data } = await api.createFacilityInvestor(facilityIdentifier, acbsFacilityInvestorInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility investor create error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityInvestorInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: acbsFacilityInvestorInput,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility investor record %o', error);
    throw new Error(`Unable to create facility investor record ${error}`);
  }
};

df.app.activity('create-facility-investor', {
  handler,
});
