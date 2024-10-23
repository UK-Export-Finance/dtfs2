const df = require('durable-functions');
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

/**
 * Handles the creation of a facility code value transaction record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Checks for missing mandatory fields in the ACBS code value transaction input.
 * 3. Submits the creation request to the ACBS system.
 * 4. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The input payload containing the facility identifier and ACBS code value transaction input.
 * @param {string} payload.facilityIdentifier - The identifier of the facility.
 * @param {Object} payload.acbsCodeValueTransactionInput - The ACBS code value transaction input details.
 * @returns {Object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API, or an object with the missing mandatory fields.
 * @throws {Error} - Throws an error if the payload is invalid, if there are missing mandatory fields, if the API request fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility code value transaction record payload');
    }

    const { facilityIdentifier, acbsCodeValueTransactionInput } = payload;
    const mandatoryFields = ['lenderTypeCode', 'initialBundleStatusCode', 'facilityTransactionCodeValueCode'];
    const missingMandatory = findMissingMandatory(acbsCodeValueTransactionInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.createCodeValueTransaction(facilityIdentifier, acbsCodeValueTransactionInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS code create value transaction error',
            status,
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsCodeValueTransactionInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: acbsCodeValueTransactionInput,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility code value transaction record %o', error);
    throw new Error(`Unable to create facility code value transaction record ${error}`);
  }
};

df.app.activity('create-code-value-transaction', {
  handler,
});
