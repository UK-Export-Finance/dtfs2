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

const updateExporter = (exporterId, token, address) => cy.request({
  url: `${BASE_URL}/gef/exporter/${exporterId}`,
  method: 'PUT',
  body: {
    correspondenceAddress: address,
  },
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
  updateExporter,
  fetchAllFacilities,
  setApplicationStatus,
  updateCoverTerms,
};
