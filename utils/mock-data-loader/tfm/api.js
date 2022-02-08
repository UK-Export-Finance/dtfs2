const axios = require('axios');
require('dotenv').config({ path: `${__dirname}/../.env` });

const urlRoot = process.env.DTFS_CENTRAL_API;

const createTeam = async (team, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/tfm/teams`,
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
    },
    url: `${urlRoot}/v1/tfm/teams`,
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
    },
    url: `${urlRoot}/v1/tfm/teams/${team.id}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};


const createUser = async (user, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/tfm/users`,
    data: { user },
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
    },
    url: `${urlRoot}/v1/tfm/users`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data.users;
};

const deleteUser = async (user) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/tfm/users/${user.username}`,
  }).catch((err) => { console.error(`err: ${err}`); });

  return response.data;
};

const listDeals = async () => {
  const response = await axios({
    method: 'get',
    url: `${urlRoot}/v1/tfm/deals`,
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
    },
    url: `${urlRoot}/v1/tfm/deals/${deal._id}`,
  }).catch(() => { });

  return response && response.data;
};

module.exports = {
  createTeam,
  createUser,
  deleteTeam,
  deleteUser,
  listTeams,
  listUsers,
  listDeals,
  deleteDeal,
};
