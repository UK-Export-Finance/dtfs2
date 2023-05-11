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
const acbs = process.env.MULESOFT_API_UKEF_TF_EA_URL;
const username = process.env.APIM_MDM_KEY;
const password = process.env.APIM_MDM_VALUE;
const axios = require('axios');

require('dotenv').config();

const getACBS = async (apiRef) => {
  if (apiRef) {
    return axios({
      method: 'get',
      url: `${acbs}/${apiRef}`,
      auth: {
        username,
        password,
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
  }
  return {
    status: 400,
    data: {},
  };
};

const postToAcbs = async (apiRef, acbsInput) => {
  if (!!apiRef && !!acbsInput) {
    return axios({
      method: 'post',
      url: `${acbs}/${apiRef}`,
      auth: {
        username,
        password,
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
  }
  return {
    status: 400,
    data: {},
  };
};

const putToAcbs = async (apiRef, acbsInput, etag) => {
  if (!!apiRef && !!acbsInput) {
    const additionalHeader = etag
      ? {
        'If-Match': etag,
      }
      : null;

    return axios({
      method: 'put',
      url: `${acbs}/${apiRef}`,
      auth: {
        username,
        password,
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
  }
  return {
    status: 400,
    data: {},
  };
};

const patchToAcbs = async (apiRef, acbsInput, eTag) => {
  if (!!apiRef && !!acbsInput) {
    const additionalHeader = eTag
      ? {
        'If-Match': eTag,
      }
      : null;

    return axios({
      method: 'patch',
      url: `${acbs}/${apiRef}`,
      auth: {
        username,
        password,
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
  }
  return {
    status: 400,
    data: {},
  };
};

const getFacility = (facilityId) => getACBS(`facility/${facilityId}`);
const getLoanId = (facilityId) => getACBS(`facility/${facilityId}/loan`);
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
const updateFacility = (facilityId, updateType, acbsInput, etag) => putToAcbs(`facility/${facilityId}?op=${updateType}`, acbsInput, etag);
const updateFacilityLoan = (facilityId, loanId, acbsInput) => patchToAcbs(`facility/${facilityId}/loan/${loanId}`, acbsInput);
const updateFacilityLoanAmount = (facilityId, loanId, acbsInput) => postToAcbs(`facility/${facilityId}/loan/${loanId}/amountAmendment`, acbsInput);

module.exports = {
  getFacility,
  getLoanId,
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
  updateFacilityLoanAmount,
};
