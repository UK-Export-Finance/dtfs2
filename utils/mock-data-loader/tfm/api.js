const axios = require('axios');
require('dotenv').config({ path: `${__dirname}/../.env` });

const urlCentralApi = process.env.DTFS_CENTRAL_API;
const tfmApi = process.env.TFM_API;
const { TFM_API_KEY, CENTRAL_API_KEY } = process.env;

const createTeam = async (team, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
      'x-api-key': CENTRAL_API_KEY,
    },
    url: `${urlCentralApi}/v1/tfm/teams`,
    data: { team },
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const listTeams = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
      'x-api-key': CENTRAL_API_KEY,
    },
    url: `${urlCentralApi}/v1/tfm/teams`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.teams;
};

const deleteTeam = async (team, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
      'x-api-key': CENTRAL_API_KEY,
    },
    url: `${urlCentralApi}/v1/tfm/teams/${team.id}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const createTfmUser = async (user, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
      'x-api-key': TFM_API_KEY,
    },
    url: `${tfmApi}/v1/users`,
    data: user,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const listUsers = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
      'x-api-key': CENTRAL_API_KEY,
    },
    url: `${urlCentralApi}/v1/tfm/users`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.users;
};

const deleteUser = async (user) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      'x-api-key': CENTRAL_API_KEY,
    },
    url: `${urlCentralApi}/v1/tfm/users/${user.username}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const listDeals = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      'x-api-key': CENTRAL_API_KEY,
    },
    url: `${urlCentralApi}/v1/tfm/deals`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.deals;
};

const deleteDeal = async (deal, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
      'x-api-key': CENTRAL_API_KEY,
    },
    url: `${urlCentralApi}/v1/tfm/deals/${deal._id}`,
  }).catch(() => { });

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
  createTfmUser
};
