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

const mandatoryFields = ['guarantorParty', 'limitKey', 'guaranteeExpiryDate', 'effectiveDate', 'maximumLiability', 'guaranteeTypeCode'];

const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility guarantee record payload');
    }

    const { facilityIdentifier, acbsFacilityGuaranteeInput } = payload;

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
    console.error('Unable to create facility guarantee record %o', error);
    throw new Error(`Unable to create facility guarantee record ${error}`);
  }
};

df.app.activity('create-facility-guarantee', {
  handler,
});
