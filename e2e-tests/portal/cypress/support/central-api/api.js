const api = () => {
  const url = `${Cypress.config('centralApiProtocol')}${Cypress.config('centralApiHost')}:${Cypress.config('centralApiPort')}`;
  return url;
};

module.exports.createFacility = (facility, dealId, user) =>
  cy.request({
    method: 'POST',
    url: `${api()}/v1/portal/facilities`,
    body: {
      facility: {
        ...facility,
        dealId,
      },
      user,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });

module.exports.updateFacility = (facilityId, facilityUpdate, user) =>
  cy.request({
    method: 'PUT',
    url: `${api()}/v1/portal/facilities/${facilityId}`,
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    body: {
      ...facilityUpdate,
      user,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });

module.exports.deleteFacility = (facilityId, user) =>
  cy.request({
    method: 'DELETE',
    url: `${api()}/v1/portal/facilities/${facilityId}`,
    body: {
      user,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });
