/*
 * Deal master record update DAF
 * **********************************
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
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = ['dealIdentifier'];

/**
 * Handles the amendment of a deal master record in ACBS.
 *
 * @async
 * @function handler
 * @param {Object} payload - The payload containing the deal amendment details.
 * @param {string} payload.dealIdentifier - The unique identifier for the deal to be amended.
 * @param {Object} payload.acbsDealMasterInput - The input data for the ACBS deal master amendment.
 * @returns {Promise<Object>} An object containing the amendment status, timestamps, sent data, and any additional data from ACBS.
 * @throws {Error} Throws an error if the payload is invalid, mandatory fields are missing, or the ACBS update fails.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility master amendment payload');
    }

    const { dealIdentifier, acbsDealMasterInput } = payload;

    const missingMandatory = findMissingMandatory(acbsDealMasterInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateDeal(dealIdentifier, acbsDealMasterInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Deal master amend error',
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: acbsDealMasterInput,
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
      dataSent: acbsDealMasterInput,
      ...data,
    };
  } catch (error) {
    console.error('Unable to amend deal master record %o', error);
    throw new Error(`Unable to amend deal master record ${error}`);
  }
};

df.app.activity('update-deal-master', {
  handler,
});
