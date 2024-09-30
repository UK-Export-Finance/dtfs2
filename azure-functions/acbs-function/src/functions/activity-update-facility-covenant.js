/*
 * Facility covenant amendment DAF
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
      throw new Error('Invalid facility covenant amendment payload');
    }

    /**
     * There are no mandatory fields for guarantee amendment payload
     * `expirationDate` is only set for cover end date attrbiute.
     * `targetAmount` is only set for the value attribute.
     */

    const { facilityIdentifier, acbsFacilityCovenantInput } = payload;
    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacilityCovenant(facilityIdentifier, acbsFacilityCovenantInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Covenant amend error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsFacilityCovenantInput,
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
      dataSent: acbsFacilityCovenantInput,
      ...data,
    };
  } catch (error) {
    console.error('Unable to amend facility convenant record %o', error);
    throw new Error(`Unable to amend facility convenant record ${error}`);
  }
};

df.app.activity('update-facility-covenant', {
  handler,
});
