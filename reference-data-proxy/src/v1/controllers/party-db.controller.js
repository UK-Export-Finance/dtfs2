const axios = require('axios');

exports.lookup = async (req, res) => {
  const { companyReg } = req.params;

  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_PARTY_DB_URL}/${companyReg}`,
    auth: {
      username: process.env.MULESOFT_API_PARTY_DB_KEY,
      password: process.env.MULESOFT_API_PARTY_DB_SECRET,
    },
  }).catch((catchErr) => catchErr.response);

  const { status, data } = response;

  return res.status(status).send(data);
};
