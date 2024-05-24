/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 *
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP trigger function
 *  * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */
const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = ['guarantorParty', 'limitKey', 'guaranteeExpiryDate', 'effectiveDate', 'maximumLiability', 'guaranteeTypeCode'];
const createFacilityGuarantee = async (context) => {
  try {
    const { facilityIdentifier, acbsFacilityGuaranteeInput } = context.bindingData;

    const missingMandatory = findMissingMandatory(acbsFacilityGuaranteeInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.createFacilityGuarantee(facilityIdentifier, acbsFacilityGuaranteeInput);

    /**
     * Multiple guarantee records are possible.
     * Adding `400` (Facility guarantee exists) to status ignore list.
     */
    if (isHttpErrorStatus(status, 400)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Guarantee create error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityGuaranteeInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: acbsFacilityGuaranteeInput,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility guarantee record. %o', error);
    throw new Error(`Unable to create facility guarantee record ${error}`);
  }
};

df.app.activity('create-facility-guarantee', {
  handler: createFacilityGuarantee,
});
