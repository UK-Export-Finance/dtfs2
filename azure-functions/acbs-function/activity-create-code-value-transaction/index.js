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

const moment = require('moment');
const api = require('../api');
const { isHttpErrorStatus } = require('../helpers/http');
const { findMissingMandatory } = require('../helpers/mandatoryFields');

const mandatoryFields = ['lenderTypeCode', 'initialBundleStatusCode', 'facilityTransactionCodeValueCode'];

const createCodeValueTransaction = async (context) => {
  try {
    const { facilityIdentifier, acbsCodeValueTransactionInput } = context.bindingData;

    const missingMandatory = findMissingMandatory(acbsCodeValueTransactionInput, mandatoryFields);

    if (missingMandatory.length) {
      return Promise.resolve({ missingMandatory });
    }

    const submittedToACBS = moment().format();
    const { status, data } = await api.createCodeValueTransaction(facilityIdentifier, acbsCodeValueTransactionInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS code create value transaction error',
            status,
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: moment().format(),
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
      receivedFromACBS: moment().format(),
      ...data,
    };
  } catch (error) {
    console.error('Error creating facility code value transaction record: %s', error);
    throw new Error('Error creating facility code value transaction record %s', error);
  }
};

module.exports = createCodeValueTransaction;
