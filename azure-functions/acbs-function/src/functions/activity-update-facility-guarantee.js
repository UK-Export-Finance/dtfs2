/*
 * Facility guarantee amendment DAF
 * ********************************
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
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');

const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility guarantee update payload');
    }

    /**
     * There are no mandatory fields for guarantee amendment payload
     * `expirationDate` is only set for cover end date attrbiute.
     * `guaranteedLimit` is only set for the value attribute.
     */

    const { facilityIdentifier, acbsFacilityGuaranteeInput } = payload;
    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacilityGuarantee(facilityIdentifier, acbsFacilityGuaranteeInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Guarantee amend error',
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
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      dataSent: acbsFacilityGuaranteeInput,
      ...data,
    };
  } catch (error) {
    console.error('Unable to amend facility guarantee record %o', error);
    throw new Error(`Unable to amend facility guarantee record ${error}`);
  }
};

df.app.activity('update-facility-guarantee', {
  handler,
});
