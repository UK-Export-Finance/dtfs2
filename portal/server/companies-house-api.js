const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.COMPANIES_HOUSE_API_URL;
const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

const getByRegistrationNumber = async (registrationNumber, returnError = false) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${urlRoot}/company/${registrationNumber}`,
      auth: {
        username: apiKey,
      },
    });
    return response.data;
  } catch (err) {
    return returnError ? err : null;
  }
};

export default {
  getByRegistrationNumber,
};
