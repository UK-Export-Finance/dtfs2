/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 *
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP trigger function
 *  * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */
const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const mandatoryFields = [
  'dealIdentifier',
  'currency',
  'dealValue',
  'guaranteeCommencementDate',
  'obligorPartyIdentifier',
  'obligorName',
  'obligorIndustryClassification',
];

const createDeal = async (context) => {
  try {
    const { deal } = context.bindingData;

    const missingMandatory = findMissingMandatory(deal, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();

    const { status, data } = await api.createDeal(deal);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Deal create error',
            status,
            dealIdentifier: deal.dealIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: deal,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: deal,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create deal master record. %o', error);
    throw new Error(`Unable to create deal master record ${error}`);
  }
};

df.app.activity('create-deal', {
  handler: createDeal,
});
