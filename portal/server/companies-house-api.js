const axios = require('axios');
require('dotenv').config();

const urlRoot = process.env.COMPANIES_HOUSE_API_URL;
const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

const searchByRegistrationNumber = async (registrationNumber) => {
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
    console.log(err);
    return null;
  }
};

export default {
  searchByRegistrationNumber,
};
