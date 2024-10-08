const { HEADERS } = require('@ukef/dtfs2-common');

const api = () => {
  const url = `${Cypress.config('centralApiProtocol')}${Cypress.config('centralApiHost')}:${Cypress.config('centralApiPort')}`;
  return url;
};

const apiKey = Cypress.config('apiKey');

const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': apiKey,
};

module.exports.createFacility = (facility, dealId, user) =>
  cy
    .request({
      method: 'POST',
      url: `${api()}/v1/portal/facilities`,
      body: {
        facility: {
          ...facility,
          dealId,
        },
        user,
      },
      headers,
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

module.exports.updateFacility = (facilityId, facilityUpdate, user) =>
  cy
    .request({
      method: 'PUT',
      url: `${api()}/v1/portal/facilities/${facilityId}`,
      headers: {
        ...headers,
        Accepts: 'application/json',
      },
      body: {
        facilityUpdate,
        user,
      },
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });

module.exports.deleteFacility = (facilityId, user, auditDetails) =>
  cy
    .request({
      method: 'DELETE',
      url: `${api()}/v1/portal/facilities/${facilityId}`,
      body: {
        user,
        auditDetails,
      },
      headers,
    })
    .then((resp) => {
      expect(resp.status).to.equal(200);
      return resp.body;
    });
