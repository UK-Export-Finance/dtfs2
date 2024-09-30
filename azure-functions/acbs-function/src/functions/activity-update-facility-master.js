/*
 * Facility master record update DAF
 * **********************************
 * This DAF (Durable Activity Function) is never invoked directly.
 * It is invoked via DOF (Durable Orchestrator Function).
 *
 * Pre-requisites
 * --------------
 * 0. 'npm install durable-functions'
 * 1. Durable  HTTP trigger function (acbs-http)
 * 2. Durable Orchestrator function (DOF) (acbs-issue-facility)
 *
 * ------------------
 * HTTP -> DOF -> DAF
 * ------------------
 */
const df = require('durable-functions');
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility master amendment payload');
    }

    const { facilityId, acbsFacilityMasterInput, updateType, etag } = payload;
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
    const missingMandatory = findMissingMandatory(acbsFacilityMasterInput, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();
    const { status, data } = await api.updateFacility(facilityId, updateType, acbsFacilityMasterInput, etag);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility update error',
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
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
      updateType,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      dataSent: acbsFacilityMasterInput,
      ...data,
    };
  } catch (error) {
    console.error('Unable to amend facility master record %o', error);
    throw new Error(`Unable to amend facility master record ${error}`);
  }
};

df.app.activity('update-facility-master', {
  handler,
});
