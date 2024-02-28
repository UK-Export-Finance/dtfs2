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

const mandatoryFields = ['guarantorParty', 'limitKey', 'guaranteeExpiryDate', 'effectiveDate', 'maximumLiability', 'guaranteeTypeCode'];
const createFacilityGuarantee = async (context) => {
  try {
    const { facilityIdentifier, acbsFacilityGuaranteeInput } = context.bindingData;

    const missingMandatory = findMissingMandatory(acbsFacilityGuaranteeInput, mandatoryFields);

    if (missingMandatory.length) {
      return Promise.resolve({ missingMandatory });
    }

    const submittedToACBS = moment().format();
    const { status, data } = await api.createFacilityGuarantee(facilityIdentifier, acbsFacilityGuaranteeInput);

    /**
     * Multiple guarantee records are possible.
     * Adding `400` (Facility guarantee exists) to status ignore list.
     */
    if (isHttpErrorStatus(status, 400)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Guarantee create error',
            facilityIdentifier,
            submittedToACBS,
            receivedFromACBS: moment().format(),
            dataReceived: data,
            dataSent: acbsFacilityGuaranteeInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: acbsFacilityGuaranteeInput,
      submittedToACBS,
      receivedFromACBS: moment().format(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility guarantee record. %s', error);
    throw new Error('Unable to create facility guarantee record. %s', error);
  }
};

module.exports = createFacilityGuarantee;
