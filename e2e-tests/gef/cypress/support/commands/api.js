/* eslint-disable no-undef */
const BASE_URL = 'http://localhost:5001/v1';

const login = (credentials) => {
  const { username, password } = credentials;

  return cy.request({
    url: `${BASE_URL}/login`,
    method: 'POST',
    body: { username, password },
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.body.token);
};

const fetchAllApplications = (token) => cy.request({
  url: `${BASE_URL}/gef/application`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

const fetchAllFacilities = (applicationId, token) => cy.request({
  url: `${BASE_URL}/gef/facilities`,
  qs: {
    applicationId,
  },
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

const updateApplication = (applicationId, token, update) => cy.request({
  url: `${BASE_URL}/gef/application/${applicationId}`,
  method: 'PUT',
  body: update,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

const setApplicationStatus = (applicationId, token, status) => cy.request({
  url: `${BASE_URL}/gef/application/status/${applicationId}`,
  method: 'PUT',
  body: { status },
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

export {
  login,
  fetchAllApplications,
  fetchAllFacilities,
  updateApplication,
  setApplicationStatus,
};
