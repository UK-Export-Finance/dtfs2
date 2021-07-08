import express from 'express';
// import axios from 'axios';
// import companiesHouseAPI from './companies-house-api';

const healthcheck = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';
// const apiUrl = process.env.TRADE_FINANCE_MANAGER_API_URL;
// const referenceDataProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

// const apiHealthCheck = async () => {
//   try {
//     const response = await axios({
//       method: 'get',
//       url: `${apiUrl}/healthcheck`,
//     });
//     return response.data;
//   } catch (err) {
//     return err;
//   }
// };

// const refDataHealthCheck = async () => {
//   try {
//     const response = await axios({
//       method: 'get',
//       url: `${referenceDataProxyUrl}/healthcheck`,
//     });
//     return response.data;
//   } catch (err) {
//     return err;
//   }
// };

healthcheck.get('/healthcheck', async (req, res) => {
  res.status(200).json({
    ui: {
      commit_hash: GITHUB_SHA,
    },
    // api: await apiHealthCheck(),
    // referenceData: await refDataHealthCheck(),
  });
});

export default healthcheck;
