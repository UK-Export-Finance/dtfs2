import companiesHouseAPI from './companies-house-api';

const express = require('express');
const axios = require('axios');
require('dotenv').config();

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

const companiesHouseHealthCheck = async () => {
  const chCheck = await companiesHouseAPI.getByRegistrationNumber('00014259');
  return chCheck ? 'ok' : 'not ok';
};

healthcheck.get('/healthcheck', async (req, res) => {
  res.status(200).json({
    ui: {
      commit_hash: GITHUB_SHA,
      companies_house: await companiesHouseHealthCheck(),
    },
    api: await apiHealthCheck(),
  });
});

export default healthcheck;
