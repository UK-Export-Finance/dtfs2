/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 *
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 *  * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */
const { getNowAsIsoString } = require('../helpers/date');
const api = require('../api');
const { isHttpErrorStatus } = require('../helpers/http');
const { findMissingMandatory } = require('../helpers/mandatoryFields');

const mandatoryFields = ['alternateIdentifier', 'industryClassification', 'name1', 'smeType', 'citizenshipClass', 'officerRiskDate', 'countryCode'];

const createParty = async (context) => {
  try {
    const { bindingData } = context;

    if (bindingData.party) {
      const { party } = context.bindingData;
      const missingMandatory = findMissingMandatory(party, mandatoryFields);

      if (missingMandatory.length) {
        return Promise.resolve({ missingMandatory });
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
    }

    return {};
  } catch (error) {
    console.error('Unable to create party record. %o', error);
    throw new Error('Unable to create party record', { cause: error });
  }
};

module.exports = createParty;
