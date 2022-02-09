/* eslint-disable no-extra-boolean-cast */
/**
* ACBS Functions API Library deals with following HTTP Methods:
* 1. GET
* 2. PUT
* 3. POST
*
* All the function have argument validation check and return object verification in
* case err object does not have expected properties due to network connection, SSL verification or other issues.
*/
const axios = require('axios');

require('dotenv').config();

const getACBS = async (apiRef) => {
  if (!!apiRef) {
    const response = await axios({
      method: 'get',
      url: `${process.env.MULESOFT_API_UKEF_TF_EA_URL}/${apiRef}`,
      auth: {
        username: process.env.MULESOFT_API_KEY,
        password: process.env.MULESOFT_API_SECRET,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((err) => ({
      status: !!err.response
        ? err.response.status
        : err,
    }));
    return response;
  }
  return {};
};

const putToACBS = async (apiRef, acbsInput, etag) => {
  if (!!apiRef && !!acbsInput) {
    const additionalHeader = etag ? {
      'If-Match': etag,
    } : null;

    const response = await axios({
      method: 'put',
      url: `${process.env.MULESOFT_API_UKEF_TF_EA_URL}/${apiRef}`,
      auth: {
        username: process.env.MULESOFT_API_KEY,
        password: process.env.MULESOFT_API_SECRET,
      },
      headers: {
        'Content-Type': 'application/json',
        ...additionalHeader,
      },
      data: acbsInput,
    }).catch((err) => ({
      status: !!err.response
        ? err.response.status
        : err,
      data: {
        error: err.response
          ? err.response.data
          : err,
      },
    }));
    return response;
  }
  return {};
};

const postToACBS = async (apiRef, acbsInput) => {
  if (!!apiRef && !!acbsInput) {
    const response = await axios({
      method: 'post',
      url: `${process.env.MULESOFT_API_UKEF_TF_EA_URL}/${apiRef}`,
      auth: {
        username: process.env.MULESOFT_API_KEY,
        password: process.env.MULESOFT_API_SECRET,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      data: [acbsInput],
    }).catch((err) => ({
      status: !!err.response
        ? err.response.status
        : err,
      data: {
        error: err.response
          ? err.response.data
          : err,
      },
    }));
    return response;
  }
  return {};
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
const createCodeValueTransaction = (acbsInput) => postToACBS('facility/codeValueTransaction', acbsInput);
const createFacilityLoan = (acbsInput) => postToACBS('facility/loan', acbsInput);
const updateFacility = (facilityId, updateType, acbsInput, etag) => putToACBS(
  `facility/${facilityId}?op=${updateType}`,
  acbsInput,
  etag,
);
const getFacility = (facilityId) => getACBS(`facility/${facilityId}`);

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
  createFacilityLoan,
  updateFacility,
  getFacility,
};
