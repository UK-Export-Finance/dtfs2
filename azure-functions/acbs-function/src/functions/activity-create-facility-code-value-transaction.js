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

const mandatoryFields = ['lenderTypeCode', 'initialBundleStatusCode', 'facilityTransactionCodeValueCode'];

const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility code value transaction record payload');
    }

    const { facilityIdentifier, acbsCodeValueTransactionInput } = payload;

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
