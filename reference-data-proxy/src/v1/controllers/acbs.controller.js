// ACBS API service it used to check that deal/facility ids are not already being used.
// the flow is:
// 1) number-generator API gives us deal and facility IDs
// 2) ACBS API tells us if the deal/facility IDs are already in use.

const axios = require('axios');

exports.checkDealId = (req, res) => {
  const dealId = req.params.id;

  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_ACBS_DEAL_URL}/${dealId}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
  }).catch((catchErr) => catchErr);

  const { status } = response;

  console.log('---------------- status ', status);

  return res.status(status);
};
