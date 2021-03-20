const axios = require('axios');

require('dotenv').config();

const postToACBS = async (type, acbsInput) => {
  const response = await axios({
    method: 'post',
    url: `${process.env.MULESOFT_API_UKEF_TF_EA_URL}/${type}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    data: [acbsInput],
  }).catch((err) => ({
    status: err.response.status,
    data: {
      error: err.response.data.error.errorDescription,
    },
  }));

  return response;
};

const createParty = (acbsInput) => postToACBS('party', acbsInput);

const createDeal = (acbsInput) => postToACBS('deal', acbsInput);

const createDealInvestor = (acbsInput) => postToACBS('deal/investor', acbsInput);

const createDealGuarantee = (acbsInput) => postToACBS('deal/guarantee', acbsInput);

const createFacility = (acbsInput) => postToACBS('facility', acbsInput);

const createFacilityInvestor = (acbsInput) => postToACBS('facility/investor', acbsInput);

const createFacilityCovenantId = (acbsInput) => postToACBS('numbers', acbsInput);

const createFacilityCovenant = (acbsInput) => postToACBS('facility/covenant', acbsInput);

const createFacilityGuarantee = (acbsInput) => postToACBS('facility/guarantee', acbsInput);

const createCodeValueTransaction = ((acbsInput) => postToACBS('facility/codeValueTransaction', acbsInput));

module.exports = {
  createParty,
  createDeal,
  createDealInvestor,
  createDealGuarantee,
  createFacility,
  createFacilityInvestor,
  createFacilityCovenantId,
  createFacilityCovenant,
  createFacilityGuarantee,
  createCodeValueTransaction,
};
