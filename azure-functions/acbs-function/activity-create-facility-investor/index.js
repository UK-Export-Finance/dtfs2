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

const mandatoryFields = ['maximumLiability', 'currency', 'guaranteeExpiryDate', 'effectiveDate'];

const createFacilityInvestor = async (context) => {
  try {
    const { facilityIdentifier, acbsFacilityInvestorInput } = context.bindingData;

    const missingMandatory = findMissingMandatory(acbsFacilityInvestorInput, mandatoryFields);

    if (missingMandatory.length) {
      return Promise.resolve({ missingMandatory });
    }

    const submittedToACBS = getNowAsIsoString();

    const { status, data } = await api.createFacilityInvestor(facilityIdentifier, acbsFacilityInvestorInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Investor create error',
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
    console.error('Unable to create facility investor record. %s', error);
    throw new Error('Unable to create facility investor record %s', error);
  }
};

module.exports = createFacilityInvestor;
