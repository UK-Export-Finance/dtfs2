const express = require('express');
const axios = require('axios');

const uploadTest = express.Router();
const dealApiUrl = process.env.DEAL_API_URL;

const apiUploadTest = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${dealApiUrl}/upload-test`,
    });
    return response.data;
  } catch (err) {
    return err;
  }
};


uploadTest.get('/upload-test', async (req, res) => {
  res.status(200).json({
    api: await apiUploadTest(),
  });
});

module.exports = uploadTest;
