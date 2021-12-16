const axios = require('axios');

exports.getExchangeRate = async (req, res) => {
  const { source, target } = req.params;

  console.log(`Calling Exchange rate API - ${source.id} to ${target}`);

  // API does not support XYZ to GBP conversion so we have to reverse and calculate
  let actualSource = source.id;
  let actualTarget = target;

  if (source !== 'GBP' && target === 'GBP') {
    actualSource = 'GBP';
    actualTarget = source;
  }

  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_URL}?source=${actualSource}&target=${actualTarget}`,
    auth: {
      username: process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_KEY,
      password: process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_SECRET,
    },
  }).catch((catchErr) => {
    console.error('Error calling Exchange rate API');
    return catchErr.response;
  });

  const { status, data } = response;

  if (status !== 200) {
    return res.status(status).send(data);
  }

  const { midPrice } = data[0];

  const responseObj = { midPrice };

  // workaround for API not supporting XYZ to GBP conversion
  if (source !== 'GBP') {
    responseObj.midPrice = (1 / midPrice);
  }

  return res.status(status).send(responseObj);
};
