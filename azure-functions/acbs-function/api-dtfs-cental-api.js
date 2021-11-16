const axios = require('axios');

const centralAPI = process.env.DTFS_CENTRAL_API;

require('dotenv').config();

const getDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralAPI}/v1/tfm/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.deal;
  } catch (error) {
    console.error(`ACBS - Error while fetching deal ${dealId}.`, { error });
    return false;
  }
};

const createActivity = async (dealId, activity) => {
  const tfm = {
    activities: [
      activity,
    ],
  };

  try {
    const response = await axios({
      method: 'put',
      url: `${centralAPI}/v1/tfm/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        tfm,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`ACBS - Error while creating activity ${dealId}.`, { error });
    return false;
  }
};

module.exports = {
  getDeal,
  createActivity,
};
