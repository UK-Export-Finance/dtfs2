const df = require('durable-functions');
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');

/**
 * Handles the amendment of a facility covenant record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Submits the amendment to the ACBS system.
 * 3. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The input payload containing the facility identifier and ACBS facility covenant input.
 * @param {string} payload.facilityIdentifier - The identifier of the facility to be amended.
 * @param {Object} payload.acbsFacilityCovenantInput - The ACBS facility covenant input details.
 * @returns {Object} - The result of the facility covenant record amendment, including status, timestamps, and data sent/received.
 * @throws {Error} - Throws an error if the input payload is invalid or if there is an error during the amendment process.
 */
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
