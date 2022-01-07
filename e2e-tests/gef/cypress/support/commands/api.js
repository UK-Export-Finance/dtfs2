const portalApi = 'http://localhost:5001/v1';

const login = (credentials) => {
  const { username, password } = credentials;

  return cy.request({
    url: `${portalApi}/login`,
    method: 'POST',
    body: { username, password },
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.body.token);
};

const fetchAllApplications = (token) => cy.request({
  url: `${portalApi}/gef/application`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

const fetchAllFacilities = (dealId, token) => cy.request({
  url: `${portalApi}/gef/facilities`,
  qs: {
    dealId,
  },
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

const createApplication = (user, token) => cy.request({
  url: `${portalApi}/gef/application`,
  method: 'POST',
  body: user,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

const updateApplication = (dealId, token, update) => cy.request({
  url: `${portalApi}/gef/application/${dealId}`,
  method: 'PUT',
  body: update,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

const createFacility = (dealId, type, token) => cy.request({
  url: `${portalApi}/gef/facilities`,
  method: 'POST',
  body: { dealId, type },
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

const updateFacility = (facilityId, token, update) => cy.request({
  url: `${portalApi}/gef/facilities/${facilityId}`,
  method: 'PUT',
  body: update,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
}).then((res) => res);

const setApplicationStatus = (dealId, token, status) => cy.request({
  url: `${portalApi}/gef/application/status/${dealId}`,
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
  createApplication,
  createFacility,
  updateFacility,
};
