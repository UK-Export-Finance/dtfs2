const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.COMPANIES_HOUSE_API_URL;
const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

const getByRegistrationNumber = async (registrationNumber) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${urlRoot}/company/${registrationNumber}`,
      auth: {
        username: apiKey,
      },
    });
    return {
      company: response.data,
    };
  } catch (err) {
    const errorResponse = err.response.data;

    if (errorResponse.errors && errorResponse.errors.length) {
      return {
        errorMessage: 'Enter a valid Companies House registration number',
      };
    }

    return {
      errorMessage: 'Enter a Companies House registration number',
    };
  }
};

export default {
  getByRegistrationNumber,
};
