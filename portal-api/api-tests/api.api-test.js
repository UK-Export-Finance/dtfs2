const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
const deal = require('./fixtures/deal-fully-completed');
const api = require('../src/v1/api');

require('dotenv').config();

const { DTFS_CENTRAL_API_URL } = process.env;

const facility = deal.mockFacilities[0];

describe('api', () => {
  const mock = new MockAdapter(axios);
  jest.mock('axios', () => jest.requireActual('axios'));

  const invalidId = '../../../etc/passwd';
  const validId = '620a1aa095a618b12da38c7b';

  describe('findOneDeal', () => {
    describe('when an invalid dealId is provided', () => {
      it('should return false', async () => {
        const response = await api.findOneDeal(invalidId);

        expect(response).toEqual(false);
      });
    });

    describe('when an valid dealId is provided', () => {
      mock.onGet(`${DTFS_CENTRAL_API_URL}/v1/portal/deals/${validId}`).reply(200, { deal });

      it('should return the deal', async () => {
        const response = await api.findOneDeal(validId);

        expect(response).toEqual(deal);
      });
    });
  });

  describe('updateDeal', () => {
    describe('when an invalid dealId is provided', () => {
      it('should return false', async () => {
        const response = await api.updateDeal(invalidId, deal, {});

        expect(response).toEqual(false);
      });
    });

    describe('when an valid dealId is provided', () => {
      mock.onPut(`${DTFS_CENTRAL_API_URL}/v1/portal/deals/${validId}`).reply(200, deal);

      it('should return the deal', async () => {
        const response = await api.updateDeal(validId, deal, {});

        expect(response).toEqual(deal);
      });
    });
  });

  describe('deleteDeal', () => {
    describe('when an invalid dealId is provided', () => {
      it('should return false', async () => {
        const response = await api.deleteDeal(invalidId, deal, {});

        expect(response).toEqual(false);
      });
    });

    describe('when an valid dealId is provided', () => {
      mock.onDelete(`${DTFS_CENTRAL_API_URL}/v1/portal/deals/${validId}`).reply(200, {});

      it('should return the status as 200', async () => {
        const response = await api.deleteDeal(validId);

        expect(response.status).toEqual(200);
      });
    });
  });

  describe('addDealComment', () => {
    describe('when an invalid dealId is provided', () => {
      it('should return false', async () => {
        const response = await api.addDealComment(invalidId, deal, {});

        expect(response).toEqual(false);
      });
    });

    describe('when an valid dealId is provided', () => {
      const success = { success: true };

      mock.onPost(`${DTFS_CENTRAL_API_URL}/v1/portal/deals/${validId}/comment`).reply(200, success);

      it('should return an object', async () => {
        const response = await api.addDealComment(validId);

        expect(response).toEqual(success);
      });
    });
  });

  describe('findOneFacility', () => {
    describe('when an invalid facilityId is provided', () => {
      it('should return false', async () => {
        const response = await api.findOneFacility(invalidId);

        expect(response).toEqual(false);
      });
    });

    describe('when an valid facilityId is provided', () => {
      mock.onGet(`${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${validId}`).reply(200, facility);

      it('should return the facility', async () => {
        const response = await api.findOneFacility(validId);

        expect(response).toEqual(facility);
      });
    });
  });

  describe('updateFacility', () => {
    describe('when an invalid facilityId is provided', () => {
      it('should return false', async () => {
        const response = await api.updateFacility(invalidId);

        expect(response).toEqual(false);
      });
    });

    describe('when an valid facilityId is provided', () => {
      mock.onPut(`${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${validId}`).reply(200, facility);

      it('should return a status of 200', async () => {
        const response = await api.updateFacility(validId, facility, {});

        expect(response.status).toEqual(200);
      });
    });
  });

  describe('deleteFacility', () => {
    describe('when an invalid facilityId is provided', () => {
      it('should return false', async () => {
        const response = await api.deleteFacility(invalidId, {});

        expect(response).toEqual(false);
      });
    });

    describe('when an valid facilityId is provided', () => {
      mock.onDelete(`${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${validId}`).reply(200, facility);

      it('should return a status of 200', async () => {
        const response = await api.deleteFacility(validId, {});

        expect(response.status).toEqual(200);
      });
    });
  });
});
