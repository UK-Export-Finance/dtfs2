const axios = require('axios');
const { isValidMongoId } = require('./validation/validateIds');

require('dotenv').config();

const { DTFS_CENTRAL_API_URL, DTFS_CENTRAL_API_KEY, TFM_API_URL, TFM_API_KEY } = process.env;

const headers = {
  central: {
    'Content-Type': 'application/json',
    'x-api-key': DTFS_CENTRAL_API_KEY,
  },
  tfm: {
    'Content-Type': 'application/json',
    'x-api-key': TFM_API_KEY,
  },
};

const findOneDeal = async (dealId) => {
  try {
    if (!isValidMongoId(dealId)) {
      console.error('Find one deal API failed for deal id %s', dealId);
      return false;
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
      headers: headers.central,
    });

    return response.data.deal;
  } catch (error) {
    console.error('Unable to find one deal %s', error);
    return false;
  }
};

const createDeal = async (deal, user) => {
  try {
    return await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals`,
      headers: headers.central,
      data: {
        deal,
        user,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

const updateDeal = async (dealId, dealUpdate, user) => {
  try {
    if (!isValidMongoId(dealId)) {
      console.error('Update deal API failed for deal id %s', dealId);
      return false;
    }

    const response = await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
      headers: headers.central,
      data: {
        dealUpdate,
        user,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to update deal %s', error);
    return false;
  }
};

const deleteDeal = async (dealId) => {
  try {
    if (!isValidMongoId(dealId)) {
      console.error('Delete deal API failed for deal id %s', dealId);
      return false;
    }

    return await axios({
      method: 'delete',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}`,
      headers: headers.central,
    });
  } catch (error) {
    console.error('Unable to delete deal %s', error);
    return { status: error?.code || 500, data: 'Error when deleting deal' };
  }
};

const addDealComment = async (dealId, commentType, comment) => {
  try {
    if (!isValidMongoId(dealId)) {
      console.error('Add deal comment API failed for deal id %s', dealId);
      return false;
    }

    const response = await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/deals/${dealId}/comment`,
      headers: headers.central,
      data: {
        commentType,
        comment,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to add deal comment %s', error);
    return false;
  }
};

const createFacility = async (facility, user) => {
  try {
    return await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities`,
      headers: headers.central,
      data: {
        facility,
        user,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

const createMultipleFacilities = async (facilities, dealId, user) => {
  try {
    return await axios({
      method: 'post',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/multiple-facilities`,
      headers: headers.central,
      data: {
        facilities,
        dealId,
        user,
      },
    });
  } catch ({ response }) {
    return response;
  }
};

const findOneFacility = async (facilityId) => {
  try {
    if (!isValidMongoId(facilityId)) {
      console.error('Find one facility API failed for facility id %s', facilityId);
      return false;
    }

    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
      headers: headers.central,
    });

    return response.data;
  } catch (error) {
    console.error('Unable to find one facility %s', error);
    return false;
  }
};

const updateFacility = async (facilityId, facility, user) => {
  try {
    if (!isValidMongoId(facilityId)) {
      console.error('Update facility API failed for facility id %s', facilityId);
      return false;
    }

    return await axios({
      method: 'put',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
      headers: headers.central,
      data: {
        ...facility,
        user,
      },
    });
  } catch (error) {
    console.error('Unable to update facility %s', error);
    return { status: error?.code || 500, data: 'Error when updating facility' };
  }
};

const deleteFacility = async (facilityId, user) => {
  try {
    if (!isValidMongoId(facilityId)) {
      console.error('Delete facility API failed for facility id %s', facilityId);
      return false;
    }

    return await axios({
      method: 'delete',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${facilityId}`,
      headers: headers.central,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Unable to delete facility %s', error);
    return { status: error?.response?.status || 500, data: 'Error when deleting facility' };
  }
};

const tfmDealSubmit = async (dealId, dealType, checker) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${TFM_API_URL}/v1/deals/submit`,
      headers: headers.tfm,
      data: {
        dealId,
        dealType,
        checker,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Unable to submit tfm deal %s', error);
    return false;
  }
};

const findLatestGefMandatoryCriteria = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: `${DTFS_CENTRAL_API_URL}/v1/portal/gef/mandatory-criteria/latest`,
      headers: headers.central,
    });

    return { status: 200, data: response.data };
  } catch (error) {
    console.error('Unable to get the latest mandatory criteria for GEF deals %s', error);
    return { status: error?.response?.status || 500, data: 'Failed to get latest mandatory criteria for GEF deals' };
  }
};

module.exports = {
  findOneDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  addDealComment,
  createFacility,
  createMultipleFacilities,
  findOneFacility,
  updateFacility,
  deleteFacility,
  tfmDealSubmit,
  findLatestGefMandatoryCriteria,
};
