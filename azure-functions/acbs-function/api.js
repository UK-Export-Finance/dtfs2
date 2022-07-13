/* eslint-disable no-extra-boolean-cast */
/**
* ACBS Functions API Library deals with following HTTP Methods:
* 1. GET
* 2. POST
* 3. PUT
* 4. PATCH
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
    }).catch((e) => {
      console.error('Error calling GET to ACBS');
      return {
        status: e.response ? e.response.status : e,
        data: { error: e.response ? e.response.data : e },
      };
    });
    return response;
  }
  return {};
};

const postToAcbs = async (apiRef, acbsInput) => {
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
    }).catch((e) => {
      console.error('Error calling POST to ACBS');
      return {
        status: e.response ? e.response.status : e,
        data: { error: e.response ? e.response.data : e },
      };
    });
    return response;
  }
  return {};
};

const putToAcbs = async (apiRef, acbsInput, etag) => {
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
    }).catch((e) => {
      console.error('Error calling PUT to ACBS');
      return {
        status: e.response ? e.response.status : e,
        data: { error: e.response ? e.response.data : e },
      };
    });
    return response;
  }
  return {};
};

const patchToAcbs = async (apiRef, acbsInput, eTag) => {
  if (!!apiRef && !!acbsInput) {
    const additionalHeader = eTag ? {
      'If-Match': eTag,
    } : null;

    const response = await axios({
      method: 'patch',
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
    }).catch((e) => {
      console.error('Error calling PATCH to ACBS');
      return {
        status: e.response ? e.response.status : e,
        data: { error: e.response ? e.response.data : e },
      };
    });

    return response;
  }
  return {};
};

const getFacility = (facilityId) => getACBS(`facility/${facilityId}`);
const createParty = (acbsInput) => postToAcbs('party', acbsInput);
const createDeal = (acbsInput) => postToAcbs('deal', acbsInput);
const createDealInvestor = (acbsInput) => postToAcbs('deal/investor', acbsInput);
const createDealGuarantee = (acbsInput) => postToAcbs('deal/guarantee', acbsInput);
const createFacility = (acbsInput) => postToAcbs('facility', acbsInput);
const createFacilityInvestor = (acbsInput) => postToAcbs('facility/investor', acbsInput);
const createFacilityCovenantId = (acbsInput) => postToAcbs('numbers', acbsInput);
const createFacilityCovenant = (acbsInput) => postToAcbs('facility/covenant', acbsInput);
const createFacilityGuarantee = (acbsInput) => postToAcbs('facility/guarantee', acbsInput);
const createCodeValueTransaction = (acbsInput) => postToAcbs('facility/codeValueTransaction', acbsInput);
const createFacilityLoan = (acbsInput) => postToAcbs('facility/loan', acbsInput);
const createFacilityFee = (acbsInput) => postToAcbs('facility/fixedFee', acbsInput);
const updateFacility = (facilityId, updateType, acbsInput, etag) => putToAcbs(
  `facility/${facilityId}?op=${updateType}`,
  acbsInput,
  etag,
);
const updateFacilityLoan = (facilityId, loanId, acbsInput) => patchToAcbs(
  `facility/${facilityId}/loan/${loanId}`,
  acbsInput,
);

module.exports = {
  getFacility,
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
  createFacilityFee,
  updateFacility,
  updateFacilityLoan,
};
