const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = ['alternateIdentifier', 'industryClassification', 'name1', 'smeType', 'citizenshipClass', 'officerRiskDate', 'countryCode'];

/**
 * This function is used to create a party record. It first checks if the party object is provided and if it contains all mandatory fields.
 * If the party object is not provided or does not contain all mandatory fields, it returns an object with the missing mandatory fields.
 * If the party object is valid, it sends a request to the API to create the party record.
 * If the API request is successful, it returns an object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * If the API request fails, it throws an error with details about the request and the error.
 * If any other error occurs, it logs the error and throws a new error.
 *
 * @param {Object} party - The party object containing the mandatory fields for creating a party record.
 * @returns {Object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API, or an object with the missing mandatory fields.
 * @throws {Error} - Throws an error if the API request fails, or if any other error occurs.
 */
const handler = async (party) => {
  try {
    if (!party) {
      return {};
    }

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
