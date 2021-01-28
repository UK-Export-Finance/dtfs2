const axios = require('axios');

exports.lookup = async (req, res) => {
  const { companyRegNo } = req.params;
  console.log('partyDb', { companyRegNo, url: `${process.env.MULESOFT_API_PARTY_DB_URL}/${companyRegNo}` });
  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_PARTY_DB_URL}/${companyRegNo}`,
    auth: {
      username: process.env.MULESOFT_API_PARTY_DB_KEY,
      password: process.env.MULESOFT_API_PARTY_DB_SECRET,
    },
  }).catch((catchErr) => catchErr.response);

  const { status, data } = response;

  return res.status(status).send(data);
};
