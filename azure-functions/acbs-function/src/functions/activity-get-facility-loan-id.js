/*
 * GET Loan ID for facility DAF
 * *****************************
 * This DAF (Durable Activity Function) is never invoked directly.
 * It is invoked via DOF (Durable Orchestrator Function).
 *
 * Pre-requisites
 * --------------
 * 0. 'npm install durable-functions'
 * 1. Durable  HTTP trigger function (acbs-http)
 * 2. Durable Orchestrator function (DOF) (acbs-amend-facility)
 *
 * ------------------
 * HTTP -> DOF -> DAF
 * ------------------
 */
const df = require('durable-functions');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');

/**
 * This function is used to get the loan ID for a given facility.
 * It first checks if the facility ID is provided. If not, it throws an error.
 * If the facility ID is provided, it sends a request to the API to get the loan ID.
 * If the API request is successful and data is returned, it returns the loanIdentifier of the first data object.
 * If the API request is not successful or no data is returned, it throws an error with details about the request and the error.
 * If any other error occurs, it throws a new error.
 *
 * @param {string} facilityId - The ID of the facility for which to get the loan ID.
 * @returns {string} - The loanIdentifier of the first data object if the API request is successful and data is returned.
 * @throws {Error} - Throws an error if the facility ID is not provided, if the API request is not successful, if no data is returned, or if any other error occurs.
 */
const handler = async (facilityId) => {
  try {
    if (!facilityId) {
      throw new Error('Invalid facility ID');
    }

    if (facilityId) {
      const { status, data } = await api.getLoanId(facilityId);

      // Non 200 HTTP response code
      if (isHttpErrorStatus(status)) {
        throw new Error(
          JSON.stringify(
            {
              name: 'ACBS Loan ID fetch error',
              facilityId,
              dataReceived: data,
            },
            null,
            4,
          ),
        );
      }

      // Validate returned data
      if (data.length) {
        const [loan] = data;

        if (loan.loanIdentifier) {
          return loan.loanIdentifier;
        }
      }

      // Throw an error upon data validation failure
      throw new Error(
        JSON.stringify(
          {
            name: 'Invalid dataset returned',
            facilityId,
            dataReceived: data,
          },
          null,
          4,
        ),
      );
    }

    return null;
  } catch (error) {
    console.error('Unable to get facility loan %o', error);
    throw new Error(`Unable to get facility loan ${error}`);
  }
};

df.app.activity('get-facility-loan-id', {
  handler,
});
