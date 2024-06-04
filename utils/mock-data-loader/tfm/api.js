const axios = require('axios');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const ApiError = require('../errors/api.error');
require('dotenv').config({ path: `${__dirname}/../.env` });

const { TFM_API_URL, TFM_API_KEY, DTFS_CENTRAL_API_URL, DTFS_CENTRAL_API_KEY } = process.env;

const createTeam = async (team) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      'x-api-key': DTFS_CENTRAL_API_KEY,
    },
    url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams`,
    // This auditDetails is mock data & doesn't correspond to an existing user.
    // Since mock data loader isn't used in production this should never occur in production data
    data: { team, auditDetails: generateTfmAuditDetails('bad123456789bad123456789') },
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const listTeams = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      'x-api-key': DTFS_CENTRAL_API_KEY,
    },
    url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.teams;
};

const deleteTeam = async (team) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      'x-api-key': DTFS_CENTRAL_API_KEY,
    },
    url: `${DTFS_CENTRAL_API_URL}/v1/tfm/teams/${team.id}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const createTfmUser = async (user, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token,
      'x-api-key': TFM_API_KEY,
    },
    url: `${TFM_API_URL}/v1/users`,
    data: user,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const listUsers = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      'x-api-key': DTFS_CENTRAL_API_KEY,
    },
    url: `${DTFS_CENTRAL_API_URL}/v1/tfm/users`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.users;
};

const deleteUser = async (user) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      'x-api-key': DTFS_CENTRAL_API_KEY,
    },
    url: `${DTFS_CENTRAL_API_URL}/v1/tfm/users/${user.username}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data;
};

const listDeals = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      'x-api-key': DTFS_CENTRAL_API_KEY,
    },
    url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response.data.deals;
};

const deleteDeal = async (deal) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      'x-api-key': DTFS_CENTRAL_API_KEY,
    },
    url: `${DTFS_CENTRAL_API_URL}/v1/tfm/deals/${deal._id}`,
  }).catch((error) => {
    throw new ApiError({ cause: error });
  });

  return response && response.data;
};

module.exports = {
  createTeam,
  deleteTeam,
  deleteUser,
  listTeams,
  listUsers,
  listDeals,
  deleteDeal,
  createTfmUser,
};
