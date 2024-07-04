const { HEADERS, isValidCompanyRegistrationNumber } = require('@ukef/dtfs2-common');
const axios = require('axios');

const { HttpStatusCode } = axios;

require('dotenv').config();

const { PORTAL_API_URL } = process.env;

const getCompanyByRegistrationNumber = async (registrationNumber, token) => {
  try {
    if (!registrationNumber) {
      return {
        errorMessage: 'Enter a Companies House registration number',
      };
    }

    if (!isValidCompanyRegistrationNumber(registrationNumber)) {
      return {
        errorMessage: 'Enter a valid Companies House registration number',
      };
    }

    const { data } = await axios.get(`${PORTAL_API_URL}/v1/companies/${registrationNumber}`, {
      headers: {
        Authorization: token,
        [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
      },
    });

    return { company: data };
  } catch (error) {
    console.error(`Error calling Portal API 'GET /companies/:registrationNumber': %o`, error);
    switch (error?.response?.status) {
      case HttpStatusCode.BadRequest:
        return {
          errorMessage: 'Enter a valid Companies House registration number',
        };
      case HttpStatusCode.NotFound:
        return {
          errorMessage: 'No company matching the Companies House registration number entered was found',
        };
      case HttpStatusCode.UnprocessableEntity:
        return {
          errorMessage: 'UKEF can only process applications from companies based in the UK',
        };
      default:
        return {
          errorMessage: 'An unknown error occurred. Please try again or enter the company details manually',
        };
    }
  }
};

module.exports = {
  getCompanyByRegistrationNumber,
};
