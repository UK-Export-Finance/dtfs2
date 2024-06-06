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

const mandatoryFields = ['alternateIdentifier', 'industryClassification', 'name1', 'smeType', 'citizenshipClass', 'officerRiskDate', 'countryCode'];

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
