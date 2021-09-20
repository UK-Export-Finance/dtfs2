const axios = require('axios');
const Sentry = require('@sentry/node');

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const create = async ({
  dealType, entityType, entityId, dealId, user,
}) => {
//   const { data } = await axios({
//     method: 'POST',
//     url: `${referenceProxyUrl}/number-generator`,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     data: {
//       dealType, entityType, entityId, dealId, user,
//     },
//   }).catch((err) => {
//     throw new Error(err.response);
//   });

  //   return data;

  let resp;
  try {
    resp = await axios({
      method: 'POST',
      url: `${referenceProxyUrl}/number-generator`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealType, entityType, entityId, dealId, user,
      },
    }).catch((err) => {
      throw new Error(err.response);
    });
  } catch (err) {
    throw new Error(err);
  }

  const { data } = resp;
  console.log(data);

  // Sentry.captureException(new Error({ data }));
  // Sentry.captureException(new Error(referenceProxyUrl));

  return data;
};

module.exports = {
  create,
};
