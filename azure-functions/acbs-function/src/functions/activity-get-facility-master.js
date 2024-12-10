const df = require('durable-functions');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');

/**
 * This function is used to fetch a facility by its ID. It first checks if the facilityIdentifier is provided.
 * If the facilityIdentifier is provided, it sends a request to the API to fetch the facility.
 * If the API request is successful, it returns an object containing the facility data and its etag.
 * If the API request fails, it throws an error with details about the request and the error.
 * If the facilityIdentifier is not provided, it throws an error.
 * If any other error occurs, it logs the error and throws a new error.
 *
 * @param {string} facilityIdentifier - The ID of the facility.
 * @returns {Object} - An object containing the facility data and its etag.
 * @throws {Error} - Throws an error if the facilityIdentifier is not provided, if the API request fails, or if any other error occurs.
 */
const handler = async (payload) => {
  try {
    const { facilityIdentifier } = payload;

    if (!facilityIdentifier) {
      throw new Error('Invalid facility ID');
    }

    if (facilityIdentifier) {
      const {
        status,
        data,
        headers: { etag },
      } = await api.getFacility(facilityIdentifier);

      if (isHttpErrorStatus(status)) {
        throw new Error(
          JSON.stringify(
            {
              name: 'ACBS Facility fetch error',
              facilityIdentifier,
              dataReceived: data,
            },
            null,
            4,
          ),
        );
      }

      return {
        acbsFacility: data,
        etag,
      };
    }

    throw new Error('Invalid argument set');
  } catch (error) {
    console.error('Unable to get facility %o', error);
    throw new Error(`Unable to get facility ${error}`);
  }
};

df.app.activity('get-facility-master', {
  handler,
});
