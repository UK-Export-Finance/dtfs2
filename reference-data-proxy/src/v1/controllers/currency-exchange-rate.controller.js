const axios = require('axios');

exports.getExchangeRate = async (req, res) => {
  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_URL}?source=GBP&target=AED`,
    auth: {
      username: process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_KEY,
      password: process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_SECRET,
    },
  }).catch((catchErr) => catchErr.response);

  const { status, data } = response;

  return res.status(status).send(data);
};
