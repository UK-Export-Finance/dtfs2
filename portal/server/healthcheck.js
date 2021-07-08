import express from 'express';
import axios from 'axios';
// import companiesHouseAPI from './companies-house-api';

const healthcheck = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';
const dealApiUrl = process.env.DEAL_API_URL;

const apiHealthCheck = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${dealApiUrl}/healthcheck`,
    });
    return response.data;
  } catch (err) {
    return err;
  }
};


/*
const companiesHouseHealthCheck = async () => {
  const coNoToCheck = '00014259';
  const chCheck = await companiesHouseAPI.getByRegistrationNumber(coNoToCheck, true);
  if (chCheck && chCheck.company_number === coNoToCheck) {
    return 'ok';
  }

  return chCheck;
};
*/

healthcheck.get('/healthcheck', async (req, res) => {
  res.status(200).json({
    ui: {
      commit_hash: GITHUB_SHA,
      //      companies_house: await companiesHouseHealthCheck(),
    },
    //   api: await apiHealthCheck(),
  });
});

export default healthcheck;
