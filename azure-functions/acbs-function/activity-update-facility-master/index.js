/*
 * Facility master record update DAF
 * **********************************
 * This DAF (Durable Activity Function) is never invoked directly.
 * It is invoked via DOF (Durable Orchestrator Function).
 *
 * Pre-requisites
 * --------------
 * 0. 'npm install durable-functions'
 * 1. Durable  HTTP starter function (acbs-http)
 * 2. Durable Orchestrator function (DOF) (acbs-issue-facility)
 *
 * ------------------
 * HTTP -> DOF -> DAF
 * ------------------
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

const updateFacilityMaster = async (context) => {
  try {
    const {
      facilityId,
      acbsFacilityMasterInput,
      updateType,
      etag,
    } = context.bindingData;

    const missingMandatory = findMissingMandatory(acbsFacilityMasterInput, mandatoryFields);

    if (missingMandatory.length) {
      return Promise.resolve({ missingMandatory });
    }

    const submittedToACBS = moment().format();

    const { status, data } = await api.updateFacility(facilityId, updateType, acbsFacilityMasterInput, etag);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify({
          name: 'ACBS Facility update error',
          submittedToACBS,
          receivedFromACBS: moment().format(),
          dataReceived: data,
          dataSent: acbsFacilityMasterInput,
        }, null, 4),
      );
    }

    return {
      status,
      updateType,
      submittedToACBS,
      receivedFromACBS: moment().format(),
      dataSent: acbsFacilityMasterInput,
      ...data,
    };
  } catch (e) {
    console.error('Error updating facility master record: ', { e });
    throw new Error(e);
  }
};

module.exports = updateFacilityMaster;
