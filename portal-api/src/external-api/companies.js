const { isValidCompanyRegistrationNumber } = require('@ukef/dtfs2-common');
const axios = require('axios');
const { HEADERS } = require('@ukef/dtfs2-common');

const { HttpStatusCode } = axios;
const dotenv = require('dotenv');

dotenv.config();
const { EXTERNAL_API_URL, EXTERNAL_API_KEY } = process.env;

const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': String(EXTERNAL_API_KEY),
};

/**
 * Returns an object with the `status` and `data` from the response from `GET /companies/{registrationNumber}` from external-api.
 * @param {string} registrationNumber
 * @returns {Promise<import('axios').AxiosResponse>}
 */
const getCompanyByRegistrationNumber = async (registrationNumber) => {
  try {
    if (!isValidCompanyRegistrationNumber(registrationNumber)) {
      console.error('Invalid company registration number provided: %s', registrationNumber);
      return {
        status: HttpStatusCode.BadRequest,
        data: {
          error: 'Bad Request',
          statusCode: HttpStatusCode.BadRequest,
        },
      };
    }

    const response = await axios.get(`${EXTERNAL_API_URL}/companies/${registrationNumber}`, { headers });

    return response;
  } catch (error) {
    console.error(`Error calling External API 'GET /companies/:registrationNumber': %o`, error);
    const status = error?.response?.status || HttpStatusCode.InternalServerError;
    const data = error?.response?.data || 'Error getting the company from External API';

    return { status, data };
  }
};

module.exports = {
  getCompanyByRegistrationNumber,
};
