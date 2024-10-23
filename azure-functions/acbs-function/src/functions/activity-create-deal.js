const df = require('durable-functions');
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

/**
 * Handles the creation of a deal master record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Checks for missing mandatory fields in the payload.
 * 3. Submits the creation request to the ACBS system.
 * 4. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The input payload containing the deal details.
 * @param {string} payload.dealIdentifier - The identifier of the deal.
 * @param {string} payload.currency - The currency of the deal.
 * @param {number} payload.dealValue - The value of the deal.
 * @param {string} payload.guaranteeCommencementDate - The commencement date of the guarantee.
 * @param {string} payload.obligorPartyIdentifier - The identifier of the obligor party.
 * @param {string} payload.obligorName - The name of the obligor.
 * @param {string} payload.obligorIndustryClassification - The industry classification of the obligor.
 * @returns {Object} - The result of the deal creation, including status, timestamps, and data sent/received.
 * @throws {Error} - Throws an error if the input payload is invalid, if there are missing mandatory fields, or if there is an error during the creation process.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid deal master record payload');
    }

    const mandatoryFields = [
      'dealIdentifier',
      'currency',
      'dealValue',
      'guaranteeCommencementDate',
      'obligorPartyIdentifier',
      'obligorName',
      'obligorIndustryClassification',
    ];
    const missingMandatory = findMissingMandatory(payload, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();

    const { status, data } = await api.createDeal(payload);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Deal create error',
            status,
            dealIdentifier: payload.dealIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: payload,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: payload,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create deal master record %o', error);
    throw new Error(`Unable to create deal master record ${error}`);
  }
};

df.app.activity('create-deal', {
  handler,
});
