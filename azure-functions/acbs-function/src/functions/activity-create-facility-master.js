const df = require('durable-functions');
const { getNowAsIsoString } = require('../../helpers/date');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');
const { findMissingMandatory } = require('../../helpers/mandatoryFields');

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

/**
 * This function is used to create a facility master record. It first checks if the payload is valid and contains all mandatory fields.
 * If the payload is valid, it sends a request to the API to create the facility master record.
 * If the API request is successful, it returns the status and data received from the API.
 * If the API request fails, it throws an error with details about the request and the error.
 * If the payload is not valid or does not contain all mandatory fields, it returns an object with the missing mandatory fields.
 * If any other error occurs, it throws a new error.
 *
 * @param {object} payload - The payload containing the mandatory fields for creating a facility master record.
 * @returns {object} - An object containing the status and data received from the API, or an object with the missing mandatory fields.
 * @throws {Error} - Throws an error if the payload is invalid, if the API request fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    if (!payload) {
      throw new Error('Invalid facility master record payload');
    }

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
