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
const activity = require('./helpers/activity');
const { isHttpErrorStatus } = require('./helpers/http');
const CONSTANTS = require('./constants');

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

    if (CONSTANTS.ACTIVITY.ACCEPTED_ENDPOINTS.includes(apiRef)
    && acbsInput._id
    && !isHttpErrorStatus(response.status)) {
      activity.add(acbsInput._id, response, apiRef, true);
    }
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
    if (CONSTANTS.ACTIVITY.ACCEPTED_ENDPOINTS.includes(apiRef)
    && acbsInput._id
    && !isHttpErrorStatus(response.status)) {
      await activity.add(acbsInput._id, response, apiRef);
    }

    return response;
  }
  return {};
};

const createParty = async (acbsInput) => postToACBS('party', acbsInput);
const createDeal = async (acbsInput) => postToACBS('deal', acbsInput);
const createDealInvestor = async (acbsInput) => postToACBS('deal/investor', acbsInput);
const createDealGuarantee = async (acbsInput) => postToACBS('deal/guarantee', acbsInput);
const createFacility = async (acbsInput) => postToACBS('facility', acbsInput);
const createFacilityInvestor = async (acbsInput) => postToACBS('facility/investor', acbsInput);
const createFacilityCovenantId = async (acbsInput) => postToACBS('numbers', acbsInput);
const createFacilityCovenant = async (acbsInput) => postToACBS('facility/covenant', acbsInput);
const createFacilityGuarantee = async (acbsInput) => postToACBS('facility/guarantee', acbsInput);
const createCodeValueTransaction = (async (acbsInput) => postToACBS('facility/codeValueTransaction', acbsInput));
const updateFacility = async (facilityId, updateType, acbsInput, etag) => putToACBS(
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
  updateFacility,
  getFacility,
};
