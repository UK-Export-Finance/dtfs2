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

const mandatoryFields = ['effectiveDate', 'limitKey', 'guaranteeExpiryDate', 'maximumLiability', 'guarantorParty'];

const createDealGuarantee = async (context) => {
  try {
    const { dealIdentifier, guarantee } = context.bindingData;

    const missingMandatory = findMissingMandatory(guarantee, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();

    const { status, data } = await api.createDealGuarantee(dealIdentifier, guarantee);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Deal Guarantee create error',
            status,
            dealIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: guarantee,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: guarantee,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create deal guarantee record. %o', error);
    throw new Error(`Unable to create deal guarantee record ${error}`);
  }
};

module.exports = createDealGuarantee;
