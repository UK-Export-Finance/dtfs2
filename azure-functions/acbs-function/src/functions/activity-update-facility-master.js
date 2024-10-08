const df = require('durable-functions');
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

/**
 * Handles the creation of a deal guarantee record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Checks for missing mandatory fields in the guarantee object.
 * 3. Submits the creation request to the ACBS system.
 * 4. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The input payload containing the deal identifier and guarantee details.
 * @param {string} payload.dealIdentifier - The identifier of the deal.
 * @param {Object} payload.guarantee - The guarantee object containing the mandatory fields.
 * @returns {Object} - An object containing the status, timestamps of when the request was sent and received, the data sent, and the data received from the API.
 * @throws {Error} - Throws an error if the payload is invalid, if the API request fails, or if any other error occurs.
 */
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
