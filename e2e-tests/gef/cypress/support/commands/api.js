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

// const createApplication = (token) => cy.request({
//   url: `${BASE_URL}/gef/application`,
//   method: 'POST',
//   body: {
//     bankInternalRefName: 'INTERNAL_REF_2',
//   },
//   headers: {
//     'Content-Type': 'application/json',
//     Authorization: token,
//   },
// }).then((res) => res);

// const updateExporter = (exporterId, token) => cy.request({
//   url: `${BASE_URL}/gef/exporter/${exporterId}`,
//   method: 'PUT',
//   body: {
//     companyName: 'MONKEY STICKS',
//   },
//   headers: {
//     'Content-Type': 'application/json',
//     Authorization: token,
//   },
// }).then((res) => res);

export {
  login,
  fetchAllApplications,
};
