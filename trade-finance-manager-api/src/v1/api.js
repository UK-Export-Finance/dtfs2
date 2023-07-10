const axios = require('axios');
const { hasValidObjectId } = require('./helpers/hasValidObjectId.helper');
const { hasValidUri } = require('./helpers/hasValidUri.helper');
const CONSTANTS = require('../constants');
require('dotenv').config();

const {
  DTFS_CENTRAL_API: centralApiUrl,
  EXTERNAL_API_URL,
  CENTRAL_API_KEY,
  EXTERNAL_API_KEY,
  AZURE_ACBS_FUNCTION_URL,
  AZURE_NUMBER_GENERATOR_FUNCTION_URL,
} = process.env;

const { DURABLE_FUNCTIONS } = CONSTANTS;

const centralApiHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': CENTRAL_API_KEY,
};

const externalApiHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': EXTERNAL_API_KEY,
};

const findOnePortalDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}`,
      headers: centralApiHeaders,
    });

    return response.data.deal;
  } catch ({ response }) {
    return false;
  }
};

const updatePortalDeal = async (dealId, update) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}`,
      headers: centralApiHeaders,
      data: {
        dealUpdate: update,
      },
    });

    return response.data;
  } catch ({ response }) {
    console.error(`TFM API - error updating BSS deal ${dealId}`);

    return false;
  }
};

const updatePortalBssDealStatus = async (dealId, status) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}/status`,
      headers: centralApiHeaders,
      data: {
        status,
      },
    });

    return response.data;
  } catch ({ response }) {
    console.error(`TFM API - error updating BSS deal status ${dealId}`);

    return false;
  }
};

const addPortalDealComment = async (dealId, commentType, comment) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}/comment`,
      headers: centralApiHeaders,
      data: {
        dealId,
        commentType,
        comment,
      },
    });

    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const updatePortalFacilityStatus = async (facilityId, status) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/facilities/${facilityId}/status`,
      headers: centralApiHeaders,
      data: {
        status,
      },
    });

    return response.data;
  } catch ({ response }) {
    console.error(`TFM API - error updating BSS facility status ${facilityId}`, response);

    return false;
  }
};

const updatePortalFacility = async (facilityId, update) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/facilities/${facilityId}`,
      headers: centralApiHeaders,
      data: update,
    });

    return response.data;
  } catch ({ response }) {
    console.error(`TFM API - error updating BSS facility ${facilityId}`);

    return false;
  }
};

const findOneDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}`,
      headers: centralApiHeaders,
    });
    return response.data.deal;
  } catch ({ response }) {
    console.error(`TFM API - error finding deal ${dealId}`);

    return false;
  }
};

const updateDeal = async (dealId, dealUpdate) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}`,
      headers: centralApiHeaders,
      data: {
        dealUpdate,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const updateDealSnapshot = async (dealId, snapshotUpdate) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}/snapshot`,
      headers: centralApiHeaders,
      data: snapshotUpdate,
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const submitDeal = async (dealType, dealId) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/submit`,
      headers: centralApiHeaders,
      data: {
        dealType,
        dealId,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const findOneFacility = async (facilityId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}`,
      headers: centralApiHeaders,
    });

    return response.data;
  } catch (err) {
    console.error(`TFM API - error finding BSS facility ${facilityId}`);

    return err;
  }
};

const findFacilitesByDealId = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}/facilities`,
      headers: centralApiHeaders,
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const updateFacility = async (facilityId, facilityUpdate) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}`,
      headers: centralApiHeaders,
      data: {
        facilityUpdate,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const createFacilityAmendment = async (facilityId) => {
  const isValid = hasValidObjectId(facilityId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'post',
        url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}/amendments`,
        headers: centralApiHeaders,
        data: { facilityId },
      });

      return response.data;
    } catch (err) {
      console.error('Error creating facility amendment %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid facilityId provided');
    return { status: 400, data: 'Invalid ObjectId' };
  }
};

const updateFacilityAmendment = async (facilityId, amendmentId, payload) => {
  const isValid = hasValidObjectId(facilityId) && hasValidObjectId(amendmentId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'put',
        url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`,
        headers: centralApiHeaders,
        data: payload,
      });

      return response.data;
    } catch (err) {
      console.error('Error creating facility amendment %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid facility Id or amendment Id provided');
    return { status: 400, data: 'Invalid facility Id or amendment Id provided' };
  }
};

const getAmendmentInProgress = async (facilityId) => {
  const isValid = hasValidObjectId(facilityId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}/amendments/in-progress`,
        headers: centralApiHeaders,
      });

      return { status: 200, data: response.data };
    } catch (err) {
      console.error('Unable to get the amendment in progress %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid facility Id');
    return { status: 400, data: 'Invalid facility Id amendment Id provided' };
  }
};

const getCompletedAmendment = async (facilityId) => {
  const isValid = hasValidObjectId(facilityId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}/amendments/completed`,
        headers: centralApiHeaders,
      });

      return response.data;
    } catch (err) {
      console.error('Unable to get the completed amendment %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid facility Id');
    return { status: 400, data: 'Invalid facility Id amendment Id provided' };
  }
};

const getLatestCompletedAmendmentValue = async (facilityId) => {
  const isValid = hasValidObjectId(facilityId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}/amendments/completed/latest-value`,
        headers: centralApiHeaders,
      });

      return response.data;
    } catch (err) {
      console.error('Unable to get the latest completed value amendment %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid facility Id');
    return { status: 400, data: 'Invalid facility Id amendment Id provided' };
  }
};

const getLatestCompletedAmendmentDate = async (facilityId) => {
  const isValid = hasValidObjectId(facilityId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}/amendments/completed/latest-cover-end-date`,
        headers: centralApiHeaders,
      });

      return response.data;
    } catch (err) {
      console.error('Unable to get the latest completed coverEndDate amendment %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid facility Id');
    return { status: 400, data: 'Invalid facility Id amendment Id provided' };
  }
};

const getAmendmentById = async (facilityId, amendmentId) => {
  const isValid = hasValidObjectId(facilityId) && hasValidObjectId(amendmentId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`,
        headers: centralApiHeaders,
      });

      return response.data;
    } catch (err) {
      console.error('Unable to get the amendment %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid facility or amendment Id');
    return { status: 400, data: 'Invalid facility Id or amendment Id provided' };
  }
};

const getAmendmentByFacilityId = async (facilityId) => {
  const isValid = hasValidObjectId(facilityId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}/amendments`,
        headers: centralApiHeaders,
      });

      return response.data;
    } catch (err) {
      console.error('Unable to get the amendment by facility Id %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid facility Id');
    return { status: 400, data: 'Invalid facility Id provided' };
  }
};

const getAmendmentsByDealId = async (dealId) => {
  const isValid = hasValidObjectId(dealId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/deals/${dealId}/amendments`,
        headers: centralApiHeaders,
      });

      return response.data;
    } catch (err) {
      console.error('Unable to get the amendments by deal Id %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid deal Id');
    return { status: 400, data: 'Invalid deal Id provided' };
  }
};

const getAmendmentInProgressByDealId = async (dealId) => {
  const isValid = hasValidObjectId(dealId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/deals/${dealId}/amendments/in-progress`,
        headers: centralApiHeaders,
      });

      return response.data;
    } catch (err) {
      console.error('Unable to get the amendment in progress by deal Id %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid deal Id');
    return { status: 400, data: 'Invalid deal Id provided' };
  }
};

const getCompletedAmendmentByDealId = async (dealId) => {
  const isValid = hasValidObjectId(dealId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/deals/${dealId}/amendments/completed`,
        headers: centralApiHeaders,
      });

      return response.data;
    } catch (err) {
      console.error('Unable to get the completed amendment by deal Id %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid deal Id');
    return { status: 400, data: 'Invalid deal Id provided' };
  }
};

const getLatestCompletedAmendmentByDealId = async (dealId) => {
  const isValid = hasValidObjectId(dealId) && hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/deals/${dealId}/amendment/completed/latest`,
        headers: centralApiHeaders,
      });

      return response.data;
    } catch (err) {
      console.error('Unable to get the latest completed amendment by deal Id %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid deal Id');
    return { status: 400, data: 'Invalid deal Id provided' };
  }
};

const getAllAmendmentsInProgress = async () => {
  const isValid = hasValidUri(centralApiUrl);
  if (isValid) {
    try {
      const response = await axios({
        method: 'get',
        url: `${centralApiUrl}/v1/tfm/amendments`,
        headers: centralApiHeaders,
      });

      return response.data;
    } catch (err) {
      console.error('Unable to get all amendments in progress %O', { response: err?.response?.data });
      return { status: 500, data: err?.response?.data };
    }
  } else {
    console.error('Invalid URL for central api');
    return { status: 400, data: 'Invalid URL for central api' };
  }
};

const updateGefFacility = async (facilityId, facilityUpdate) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/gef/facilities/${facilityId}`,
      headers: centralApiHeaders,
      data: facilityUpdate,
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const queryDeals = async ({ queryParams, start = 0, pagesize = 0 }) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/deals`,
      headers: centralApiHeaders,
      data: {
        queryParams,
        start,
        pagesize,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const getPartyDbInfo = async ({ companyRegNo }) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/party-db/${encodeURIComponent(companyRegNo)}`,
      headers: externalApiHeaders,
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

/**
 * Get company information from Party URN
 * @param {Integer} partyUrn Party URN
 * @returns {Object} Company information
 */
const getCompanyInfo = async (partyUrn) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/party-db/urn/${encodeURIComponent(partyUrn)}`,
      headers: externalApiHeaders,
    });

    return response.data;
  } catch ({ error }) {
    console.error('Unable to get company information from PartyURN', { error });
    return false;
  }
};

const findUser = async (username) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/users/${username}`,
      headers: centralApiHeaders,
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findUserById = async (userId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/users/id/${userId}`,
      headers: centralApiHeaders,
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findPortalUserById = async (userId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/user/${userId}`,
      headers: centralApiHeaders,
    });
    return response.data;
  } catch ({ response }) {
    console.error('Error finding portal user', response);
    return false;
  }
};

const updateUserTasks = async (userId, updatedTasks) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/users/${userId}/tasks`,
      headers: centralApiHeaders,
      data: {
        updatedTasks,
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findOneTeam = async (teamId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/teams/${teamId}`,
      headers: centralApiHeaders,
    });

    return response.data.team;
  } catch (err) {
    return err;
  }
};

const findTeamMembers = async (teamId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/users/team/${teamId}`,
      headers: centralApiHeaders,
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const getCurrencyExchangeRate = async (source, target) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/currency-exchange-rate/${source}/${target}`,
      headers: externalApiHeaders,
    });
    return response.data;
  } catch (err) {
    return { err };
  }
};

const getFacilityExposurePeriod = async (startDate, endDate, type) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/exposure-period/${startDate}/${endDate}/${type}`,
      headers: externalApiHeaders,
    });

    return response.data;
  } catch (err) {
    console.error('TFM-API - Failed api call to getFacilityExposurePeriod', { err });
    return err;
  }
};

const getPremiumSchedule = async (premiumScheduleParameters) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${EXTERNAL_API_URL}/premium-schedule`,
      headers: externalApiHeaders,
      data: premiumScheduleParameters,
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
    return null;
  } catch ({ response }) {
    console.error('TFM-API error calling premium schedule', { response });
    return null;
  }
};

const createACBS = async (deal, bank) => {
  if (!!deal && !!bank) {
    try {
      const response = await axios({
        method: 'post',
        url: `${EXTERNAL_API_URL}/acbs`,
        headers: externalApiHeaders,
        data: {
          deal,
          bank,
        },
      });
      return response.data;
    } catch (err) {
      console.error('ACBS create error\n\r', err);
      return false;
    }
  }
  return {};
};

const updateACBSfacility = async (facility, deal) => {
  if (!!facility && !!deal) {
    try {
      const response = await axios({
        method: 'post',
        url: `${EXTERNAL_API_URL}/acbs/facility/${facility.ukefFacilityId}/issue`,
        headers: externalApiHeaders,
        data: {
          facility,
          deal,
        },
      });
      return response.data;
    } catch (err) {
      console.error('TFM-API Facility update error', { err });
      return err;
    }
  }
  return {};
};

/**
 * ACBS facility amendment
 * @param {String} ukefFacilityId UKEF Facility ID
 * @param {Object} amendments Facility object comprising of amendments
 * @returns {Object} updated FMR upon success otherwise error
 */
const amendACBSfacility = async (amendments, facility, deal) => {
  if (amendments && facility.facilitySnapshot) {
    const { ukefFacilityId } = facility.facilitySnapshot;
    const response = await axios({
      method: 'post',
      url: `${EXTERNAL_API_URL}/acbs/facility/${ukefFacilityId}/amendments`,
      headers: externalApiHeaders,
      data: {
        amendments,
        deal,
        facility,
      },
    }).catch((e) => {
      console.error('TFM-API Facility amend error', { e });
      return null;
    });

    if (response.data) {
      return response.data;
    }
  }
  return null;
};

const getFunctionsAPI = async (type = DURABLE_FUNCTIONS.TYPE.ACBS, url = '') => {
  let functionUrl;
  switch (type) {
    case DURABLE_FUNCTIONS.TYPE.ACBS:
      functionUrl = AZURE_ACBS_FUNCTION_URL;
      break;

    case DURABLE_FUNCTIONS.TYPE.NUMBER_GENERATOR:
      functionUrl = AZURE_NUMBER_GENERATOR_FUNCTION_URL;
      break;

    default:
  }

  let modifiedUrl = url.replace(/http:\/\/localhost:[\d]*/, functionUrl);
  if (type === DURABLE_FUNCTIONS.TYPE.ACBS) {
    modifiedUrl = url ? url.replace(/http:\/\/localhost:[\d]*/, functionUrl) : functionUrl;
  }

  try {
    const response = await axios({
      method: 'get',
      url: modifiedUrl,
    });
    return response.data;
  } catch (err) {
    console.error(`Unable to getFunctionsAPI for ${modifiedUrl}`, { err });
    return err;
  }
};

const createEstoreFolders = async (data) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${EXTERNAL_API_URL}/estore`,
      headers: externalApiHeaders,
      data,
    });
    return response.data;
  } catch (err) {
    console.error({ err });
    return {};
  }
};

const sendEmail = async (templateId, sendToEmailAddress, emailVariables) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${EXTERNAL_API_URL}/email`,
      headers: externalApiHeaders,
      data: {
        templateId,
        sendToEmailAddress,
        emailVariables,
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findOneGefDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/portal/gef/deals/${dealId}`,
      headers: centralApiHeaders,
    });

    return response.data;
  } catch (err) {
    console.error(`TFM API - error finding GEF deal ${dealId}`);

    return false;
  }
};

const updatePortalGefDealStatus = async (dealId, status) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/gef/deals/${dealId}/status`,
      headers: centralApiHeaders,
      data: {
        status,
      },
    });

    return response.data;
  } catch (err) {
    console.error(`TFM API - error updating GEF deal status ${dealId}`);

    return false;
  }
};

const updatePortalGefDeal = async (dealId, update) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/gef/deals/${dealId}`,
      headers: centralApiHeaders,
      data: {
        dealUpdate: update,
      },
    });

    return response.data;
  } catch (err) {
    console.error(`TFM API - error updating GEF deal ${dealId}`, { err });

    return false;
  }
};

const updateGefMINActivity = async (dealId) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/gef/deals/activity/${dealId}`,
      headers: centralApiHeaders,
    });

    return response.data;
  } catch (err) {
    console.error(`TFM API - error updating GEF deal MIN activity ${dealId}`, { err });

    return false;
  }
};

const addUnderwriterCommentToGefDeal = async (dealId, commentType, comment) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${centralApiUrl}/v1/portal/gef/deals/${dealId}/comment`,
      headers: centralApiHeaders,
      data: { dealId, commentType, comment },
    });

    return response.data;
  } catch ({ response }) {
    console.error('Unable to add a comment as an underwriter ', response);
    return false;
  }
};

const getAllFacilities = async (searchString) => {
  try {
    const response = await axios({
      method: 'GET',
      data: searchString,
      url: `${centralApiUrl}/v1/tfm/facilities`,
      headers: centralApiHeaders,
    });
    return response.data;
  } catch ({ response }) {
    console.error('Unable to get all facilities', response);
    return response;
  }
};

const findBankById = async (bankId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/bank/${bankId}`,
      headers: centralApiHeaders,
    });
    return response.data;
  } catch (response) {
    console.error('Unable to get bank by id', response?.data);
    return response?.data;
  }
};

const getGefMandatoryCriteriaByVersion = async (version) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/portal/gef/mandatory-criteria/version/${version}`,
      headers: centralApiHeaders,
    });

    return response.data;
  } catch (err) {
    console.error('Unable to get the mandatory criteria by version for GEF deals %O', err);
    return err;
  }
};

module.exports = {
  findOneDeal,
  findOnePortalDeal,
  addPortalDealComment,
  updatePortalDeal,
  updatePortalBssDealStatus,
  updatePortalFacilityStatus,
  updatePortalFacility,
  updateDeal,
  updateDealSnapshot,
  submitDeal,
  getAllFacilities,
  findOneFacility,
  findFacilitesByDealId,
  updateFacility,
  createFacilityAmendment,
  updateFacilityAmendment,
  getAmendmentInProgress,
  getCompletedAmendment,
  getLatestCompletedAmendmentValue,
  getLatestCompletedAmendmentDate,
  getAmendmentById,
  getAmendmentByFacilityId,
  getAmendmentsByDealId,
  getAmendmentInProgressByDealId,
  getCompletedAmendmentByDealId,
  getLatestCompletedAmendmentByDealId,
  getAllAmendmentsInProgress,
  updateGefFacility,
  queryDeals,
  getPartyDbInfo,
  getCompanyInfo,
  findUser,
  findUserById,
  findPortalUserById,
  updateUserTasks,
  findOneTeam,
  findTeamMembers,
  getCurrencyExchangeRate,
  getFacilityExposurePeriod,
  getPremiumSchedule,
  createACBS,
  updateACBSfacility,
  amendACBSfacility,
  getFunctionsAPI,
  createEstoreFolders,
  sendEmail,
  findOneGefDeal,
  updatePortalGefDealStatus,
  updatePortalGefDeal,
  addUnderwriterCommentToGefDeal,
  updateGefMINActivity,
  findBankById,
  getGefMandatoryCriteriaByVersion,
};
