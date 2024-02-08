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

const mandatoryFields = [
  'dealIdentifier',
  'facilityIdentifier',
  'dealBorrowerIdentifier',
  'maximumLiability',
  'productTypeId',
  'productTypeName',
  'currency',
  'guaranteeExpiryDate',
  'nextQuarterEndDate',
  'delegationType',
  'interestOrFeeRate',
  'facilityStageCode',
  'exposurePeriod',
  'creditRatingCode',
  'premiumFrequencyCode',
  'riskCountryCode',
  'riskStatusCode',
  'effectiveDate',
  'forecastPercentage',
  'agentBankIdentifier',
  'obligorPartyIdentifier',
  'obligorIndustryClassification',
];

const createFacilityMaster = async (context) => {
  try {
    const { acbsFacilityMasterInput } = context.bindingData;

    const missingMandatory = findMissingMandatory(acbsFacilityMasterInput, mandatoryFields);

    if (missingMandatory.length) {
      return Promise.resolve({ missingMandatory });
    }

    const submittedToACBS = moment().format();

    const { status, data } = await api.createFacility(acbsFacilityMasterInput);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility Master create error',
            dealIdentifier: acbsFacilityMasterInput.dealIdentifier,
            submittedToACBS,
            receivedFromACBS: moment().format(),
            dataReceived: data,
            dataSent: acbsFacilityMasterInput,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: acbsFacilityMasterInput,
      submittedToACBS,
      receivedFromACBS: moment().format(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility master record. %o', error);
    throw new Error('Unable to create facility master record %o', error);
  }
};

module.exports = createFacilityMaster;
