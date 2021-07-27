const axios = require('axios');

exports.lookup = async (req, res) => {
  const { companyRegNo } = req.params;

  const sanitisedRegNo = companyRegNo.padStart(8, '0');

  const response = await axios({
    method: 'get',
    url: `${process.env.COMPANIES_HOUSE_API_URL}/company/${sanitisedRegNo}`,
    auth: {
      username: process.env.COMPANIES_HOUSE_API_KEY,
    },
  }).catch((catchErr) => catchErr.response);

  const { status, data } = response;

  return res.status(status).send(data);
};
