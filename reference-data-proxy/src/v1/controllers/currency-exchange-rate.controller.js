const axios = require('axios');

exports.getExchangeRate = async (req, res) => {
  console.log('Calling Exchange rate API');

  const { source, target } = req.params;

  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_URL}?source=${source}&target=${target}`,
    auth: {
      username: process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_KEY,
      password: process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_SECRET,
    },
  }).catch((catchErr) => {
    console.error('Error calling Exchange rate API');
    return catchErr.response;
  });

  const { status, data } = response;

  return res.status(status).send(data[0]);
};
