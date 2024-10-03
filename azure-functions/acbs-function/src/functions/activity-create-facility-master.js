const df = require('durable-functions');
const api = require('../../api');
const { getNowAsIsoString } = require('../../helpers/date');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

/**
 * Handles the creation of a facility master record in the ACBS system.
 *
 * This function performs the following operations:
 * 1. Validates the input payload.
 * 2. Checks for missing mandatory fields in the payload.
 * 3. Submits the creation request to the ACBS system.
 * 4. Handles the response from the ACBS system and returns the result.
 *
 * @param {Object} payload - The payload containing the mandatory fields for creating a facility master record.
 * @param {string} payload.dealIdentifier - The identifier of the deal.
 * @param {string} payload.facilityIdentifier - The identifier of the facility.
 * @param {string} payload.dealBorrowerIdentifier - The identifier of the deal borrower.
 * @param {number} payload.maximumLiability - The maximum liability amount.
 * @param {string} payload.productTypeId - The product type ID.
 * @param {string} payload.productTypeName - The product type name.
 * @param {string} payload.currency - The currency of the facility.
 * @param {string} payload.guaranteeExpiryDate - The expiry date of the guarantee.
 * @param {string} payload.nextQuarterEndDate - The next quarter end date.
 * @param {string} payload.delegationType - The delegation type.
 * @param {number} payload.interestOrFeeRate - The interest or fee rate.
 * @param {string} payload.facilityStageCode - The facility stage code.
 * @param {string} payload.exposurePeriod - The exposure period.
 * @param {string} payload.creditRatingCode - The credit rating code.
 * @param {string} payload.premiumFrequencyCode - The premium frequency code.
 * @param {string} payload.riskCountryCode - The risk country code.
 * @param {string} payload.riskStatusCode - The risk status code.
 * @param {string} payload.effectiveDate - The effective date.
 * @param {number} payload.forecastPercentage - The forecast percentage.
 * @param {string} payload.agentBankIdentifier - The identifier of the agent bank.
 * @param {string} payload.obligorPartyIdentifier - The identifier of the obligor party.
 * @param {string} payload.obligorIndustryClassification - The industry classification of the obligor.
 * @returns {Object} - An object containing the status and data received from the API, or an object with the missing mandatory fields.
 * @throws {Error} - Throws an error if the payload is invalid, if the API request fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility master record payload');
    }

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
    const missingMandatory = findMissingMandatory(payload, mandatoryFields);

    if (missingMandatory.length) {
      return { missingMandatory };
    }

    const submittedToACBS = getNowAsIsoString();

    const { status, data } = await api.createFacility(payload);

    if (isHttpErrorStatus(status)) {
      throw new Error(
        JSON.stringify(
          {
            name: 'ACBS Facility master create error',
            dealIdentifier: payload.dealIdentifier,
            submittedToACBS,
            receivedFromACBS: getNowAsIsoString(),
            dataReceived: data,
            dataSent: payload,
          },
          null,
          4,
        ),
      );
    }

    return {
      status,
      dataSent: payload,
      submittedToACBS,
      receivedFromACBS: getNowAsIsoString(),
      ...data,
    };
  } catch (error) {
    console.error('Unable to create facility master record %o', error);
    throw new Error(`Unable to create facility master record ${error}`);
  }
};

df.app.activity('create-facility-master', {
  handler,
});
