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
  'portfolioIdentifier',
  'dealBorrowerIdentifier',
  'maximumLiability',
  'productTypeId',
  'productTypeName',
  'currency',
  'guaranteeCommencementDate',
  'guaranteeExpiryDate',
  'nextQuarterEndDate',
  'delegationType',
  'intrestOrFeeRate',
  'facilityStageCode',
  'exposurePeriod',
  'creditRatingCode',
  'guaranteePercentage',
  'premiumFrequencyCode',
  'riskCountryCode',
  'riskStatusCode',
  'effectiveDate',
  'foreCastPercentage',
  'description',
  'agentBankIdentifier',
  'obligorPartyIdentifier',
  'obligorName',
  'obligorIndustryClassification',
];

const createFacilityMaster = async (context) => {
  const { acbsFacilityMasterInput } = context.bindingData;

  const missingMandatory = findMissingMandatory(acbsFacilityMasterInput, mandatoryFields);

  if (missingMandatory.length) {
    return Promise.resolve({ missingMandatory });
  }

  const submittedToACBS = moment().format();

  const { status, data } = await api.createFacility(acbsFacilityMasterInput);

  if (isHttpErrorStatus(status)) {
    throw new Error(`
      ACBS Facility create error. 
      dealIdentifier: ${acbsFacilityMasterInput.dealIdentifier}, 
      submittedToACBS: ${submittedToACBS}, 
      receivedFromACBS: ${moment().format()}, 
      dataReceived: ${JSON.stringify(data, null, 4)}
      datSent: ${JSON.stringify(acbsFacilityMasterInput, null, 4)}
     `);
  }

  return {
    submittedToACBS,
    receivedFromACBS: moment().format(),
    ...data,
  };
};

module.exports = createFacilityMaster;
