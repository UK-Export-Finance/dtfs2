const axios = require('axios');
require('dotenv').config({ path: `${__dirname}/../.env` });

// TODO multiple services talk to the same api; we end up writing basically the same code twice to achieve this
//  ... a binary repo to publish things to so we can share? ... local references in package.json??

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
    data: team,
  }).catch((err) => { console.log(`err: ${err}`); });

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
  }).catch((err) => { console.log(`err: ${err}`); });

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
  }).catch((err) => { console.log(`err: ${err}`); });

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
    data: user,
  }).catch((err) => { console.log(`err: ${err}`); });

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
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.users;
};

const deleteUser = async (user) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/tfm/users/${user._id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};


module.exports = {
  createTeam,
  createUser,
  deleteTeam,
  deleteUser,
  listTeams,
  listUsers,
};
