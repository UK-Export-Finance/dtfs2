const df = require('durable-functions');
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

/**
 * Handles the creation of a party record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input party object.
 * 2. Checks for missing mandatory fields in the party object.
 * 3. Submits the creation request to the ACBS system.
 * 4. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} party - The party object containing the mandatory fields for creating a party record.
 * @param {string} party.alternateIdentifier - The alternate identifier for the party.
 * @param {string} party.industryClassification - The industry classification of the party.
 * @param {string} party.name1 - The name of the party.
 * @param {string} party.smeType - The SME type of the party.
 * @param {string} party.citizenshipClass - The citizenship class of the party.
 * @param {string} party.officerRiskDate - The officer risk date for the party.
 * @param {string} party.countryCode - The country code of the party.
 * @returns {Object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API, or an object with the missing mandatory fields.
 * @throws {Error} - Throws an error if the API request fails, or if any other error occurs.
 */
const handler = async (party) => {
  try {
    if (!party) {
      return {};
    }

    const mandatoryFields = ['alternateIdentifier', 'industryClassification', 'name1', 'smeType', 'citizenshipClass', 'officerRiskDate', 'countryCode'];
    const missingMandatory = findMissingMandatory(party, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.createParty(party);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Party create error',
            status,
            UKEF_ID: party.alternateIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: party,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: party,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create party record %o', error);
    throw new Error(`Unable to create party record ${error}`);
  }
};

df.app.activity('create-party', {
  handler,
});
