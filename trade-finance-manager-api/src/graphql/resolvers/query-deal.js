const axios = require('axios');
const dealReducer = require('../reducers/deal');
require('dotenv').config();

// TODO move to something like
// dealApi.getDeal

const urlRoot = process.env.DEAL_API_URL;

// TEMP for init dev
const TEMP_TOKEN = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZmFkNGI1MmYwNDQyNjAwMTI2ZTExNTgiLCJpYXQiOjE2MDU3ODE0ODcxNTAsInVzZXJuYW1lIjoiTUFLRVIiLCJyb2xlcyI6WyJtYWtlciJdLCJiYW5rIjp7ImlkIjoiOTU2IiwibmFtZSI6IkJhcmNsYXlzIEJhbmsiLCJlbWFpbHMiOlsibWFrZXI0QHVrZXhwb3J0ZmluYW5jZS5nb3YudWsiLCJjaGVja2VyNEB1a2V4cG9ydGZpbmFuY2UuZ292LnVrIl19LCJleHAiOjE2MDU3ODE1NzM1NTB9.Pn9EIso8N-luguQlA-f-VO8pCsYwV31rFwuIqyV-Nw7k0LqhW4xB5C0ynAFVzh3xi9eKf8g53ldXKEiIsBaiwgUj_GzxMy6vvRhTQOO_lezOft_J_hXVtGa567zlICGUwibQgIhb_YkTHnYYSmuJQIbubiJ9opLamXJUcpo0Uq4WJr_sWtPUu-XZrqcCP4TUqM1SazSqpsX7f2yrUaa8xVWqqMjCBoxeJdEl49gIeu98wIrQahm7mXv1s6O15eP_cFBwx5wqn2V04-kHtmg_phhI99-zGSLNKR2UZo7wQSZpszsrLyJ2d77qG2vM63UNrCg6iHitd_lcjSV10yeVCK_qYgqTO4nJQvXqp1BJ8rhMoADJdILSVRDJQ3qyGBoEoy6as6VMOym_nKeyVsxjqfjENYNcMYSpPHte9SnpVF6RrwQVfzIAvYFBWdu5VmlTYXUzhNYt0V6-hng7ZWrStBnf8KJUuVGUwsff-blusc5oMlr05ZWf42RdU6Hu_lTyGLw6ZMtHG_wjHwgdJrwIUH-6v6lDT7E5gRyzKNDox95Z1FXrL6rDBRllYl9xvgHLb1_jhgtbbLZ44ajNjsdclgjYuwK9FCIStiTsWrxbibOc2ue5G_A_IBcRrkW6G82hYyjUMOOY8EeNMZ7DceBOXsuYN1jgi2nUPBdYODQyAWA';

const getDeal = async () => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/deals/1000581`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: TEMP_TOKEN,
    },
  }).catch((err) => err);

  return response.data;
};


const queryDeal = async () => {
  const dealResponse = await getDeal()

  return dealReducer(dealResponse.deal);
};

module.exports = queryDeal;
