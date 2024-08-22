/**
 * This function is an Azure Durable activity function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 */

const df = require('durable-functions');
const { HttpStatusCode } = require('axios');
const mdm = require('../../apim-mdm');
const CONSTANTS = require('../../constants');

/**
 * Asynchronous function that retrieves the ACBS country code for a given country.
 *
 * @param {string} country - The country for which the ACBS country code is to be retrieved.
 * @returns {Promise<string>} The ISO code of the country if successful, otherwise returns the default country code.
 */
const handler = async (country) => {
  try {
    const { status, data } = await mdm.getACBSCountryCode(country);

    // Check if the request was successful and data was returned
    if (status === HttpStatusCode.Ok && data?.length) {
      return data[0].isoCode;
    }

    return CONSTANTS.DEAL.COUNTRY.DEFAULT;
  } catch (error) {
    console.error(`Failed to get ACBS country code for country %s %o`, country, error);
    return CONSTANTS.DEAL.COUNTRY.DEFAULT;
  }
};

df.app.activity('get-acbs-country-code', {
  handler,
});
