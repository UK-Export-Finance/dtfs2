const axios = require('axios');
const { isValidCompaniesHouseNumber } = require('./validation/validate-ids');

require('dotenv').config();

const { PORTAL_API_URL } = process.env;

const getCompanyByRegistrationNumber = async (registrationNumber, token) => {
  try {
    if (!registrationNumber) {
      return {
        errorMessage: 'Enter a Companies House registration number.',
      };
    }

    if (!isValidCompaniesHouseNumber(registrationNumber)) {
      return {
        errorMessage: 'Enter a valid Companies House registration number.',
      };
    }

    const { data } = await axios.get(`${PORTAL_API_URL}/v1/companies/${registrationNumber}`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    return { company: data };
  } catch (error) {
    switch (error?.response?.status) {
      case 400:
        return {
          errorMessage: 'Enter a valid Companies House registration number.',
        };
      case 404:
        return {
          errorMessage: 'No company matching the Companies House registration number entered was found.',
        };
      case 422:
        return {
          errorMessage: 'UKEF can only process applications from companies based in the UK.',
        };
      default:
        return {
          errorMessage: 'An unknown error occurred. Please try again or enter the company details manually.',
        };
    }
  }
};

module.exports = {
  getCompanyByRegistrationNumber,
};
