const df = require('durable-functions');
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');

/**
 * Handles the amendment of a facility guarantee record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Submits the amendment to the ACBS system.
 * 3. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The input payload containing the facility ID and ACBS facility guarantee input.
 * @param {string} payload.facilityId - The ID of the facility to be amended.
 * @param {Object} payload.acbsFacilityGuaranteeInput - The ACBS facility guarantee input details.
 * @returns {Object} - The result of the facility guarantee record amendment, including status, timestamps, and data sent/received.
 * @throws {Error} - Throws an error if the input payload is invalid or if there is an error during the amendment process.
 */
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

    const { facilityId, acbsFacilityGuaranteeInput } = payload;
    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacilityGuarantee(facilityId, acbsFacilityGuaranteeInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Guarantee amend error',
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
