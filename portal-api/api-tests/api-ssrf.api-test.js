const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
const deal = require('./fixtures/deal-fully-completed');
const api = require('../src/v1/api');

require('dotenv').config();

const { DTFS_CENTRAL_API_URL } = process.env;

const [facility] = deal.mockFacilities;

describe('api', () => {
  const mock = new MockAdapter(axios);

  const invalidId = '../../../etc/passwd';
  const validId = '620a1aa095a618b12da38c7b';
  const validNonExistentId = '620a1aa095a6bbbbbbbbb';
  const mockPortalAuditDetails = generatePortalAuditDetails(validId);

  describe('findOneDeal', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.findOneDeal(invalidId);

      expect(response).toEqual(false);
    });

    it('should return the deal when a valid dealId is provided', async () => {
      mock.onGet(`${DTFS_CENTRAL_API_URL}/v1/portal/deals/${validId}`).reply(200, { deal });

      const response = await api.findOneDeal(validId);

      expect(response).toEqual(deal);
    });

    it('should return false when a non-existent dealId is provided', async () => {
      const response = await api.findOneDeal(validNonExistentId);

      expect(response).toEqual(false);
    });
  });

  describe('updateDeal', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateDeal(invalidId, deal, {}, mockPortalAuditDetails);

      expect(response).toEqual(false);
    });

    it('should return the deal when a valid dealId is provided', async () => {
      mock.onPut(`${DTFS_CENTRAL_API_URL}/v1/portal/deals/${validId}`).reply(200, deal);

      const response = await api.updateDeal(validId, deal, {}, mockPortalAuditDetails);

      expect(response).toEqual(deal);
    });

    it('should return deal when a non-existent dealId is provided', async () => {
      const response = await api.updateDeal(validNonExistentId, deal, {}, mockPortalAuditDetails);

      expect(response).toEqual(false);
    });
  });

  describe('deleteDeal', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.deleteDeal(invalidId, mockPortalAuditDetails);

      expect(response).toEqual(false);
    });

    it('should return the status as 200 when a valid dealId is provided', async () => {
      mock.onDelete(`${DTFS_CENTRAL_API_URL}/v1/portal/deals/${validId}`).reply(200, {});

      const response = await api.deleteDeal(validId, mockPortalAuditDetails);

      expect(response.status).toEqual(200);
    });

    it('should return false when a non-existent dealId is provided', async () => {
      const response = await api.deleteDeal(validNonExistentId, mockPortalAuditDetails);

      expect(response.status).toEqual(undefined);
    });
  });

  describe('addDealComment', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.addDealComment(invalidId, deal, {});

      expect(response).toEqual(false);
    });

    it('should return an object when a valid dealId is provided', async () => {
      const success = { success: true };

      mock.onPost(`${DTFS_CENTRAL_API_URL}/v1/portal/deals/${validId}/comment`).reply(200, success);

      const response = await api.addDealComment(validId);

      expect(response).toEqual(success);
    });

    it('should return false when a non-existent dealId is provided', async () => {
      const response = await api.addDealComment(validNonExistentId, deal, {});

      expect(response).toEqual(false);
    });
  });

  describe('findOneFacility', () => {
    it('should return false when an invalid facilityId is provided', async () => {
      const response = await api.findOneFacility(invalidId);

      expect(response).toEqual(false);
    });

    it('should return the facility when a valid facilityId is provided', async () => {
      mock.onGet(`${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${validId}`).reply(200, facility);

      const response = await api.findOneFacility(validId);

      expect(response).toEqual(facility);
    });

    it('should return false when a non-existent facilityId is provided', async () => {
      const response = await api.findOneFacility(validNonExistentId);

      expect(response).toEqual(false);
    });
  });

  describe('updateFacility', () => {
    it('should return false when an invalid facilityId is provided', async () => {
      const response = await api.updateFacility(invalidId);

      expect(response).toEqual(false);
    });

    it('should return a status of 200 when a valid facilityId is provided', async () => {
      mock.onPut(`${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${validId}`).reply(200, facility);

      const response = await api.updateFacility(validId, facility, {});

      expect(response.status).toEqual(200);
    });

    it('should return false when a non-existent facilityId is provided', async () => {
      const response = await api.updateFacility(validNonExistentId);

      expect(response).toEqual(false);
    });
  });

  describe('deleteFacility', () => {
    it('should return false when an invalid facilityId is provided', async () => {
      const response = await api.deleteFacility(invalidId, {});

      expect(response).toEqual(false);
    });

    it('should return a status of 200 when a valid facilityId is provided', async () => {
      mock.onDelete(`${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${validId}`).reply(200, facility);

      const response = await api.deleteFacility(validId, {});

      expect(response.status).toEqual(200);
    });

    it('should return false when a non-existent facilityId is provided', async () => {
      const response = await api.deleteFacility(validNonExistentId, {});

      expect(response).toEqual(false);
    });
  });
});
