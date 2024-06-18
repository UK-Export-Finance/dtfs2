const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
const deal = require('./fixtures/deal-fully-completed');
const api = require('../src/v1/api');
const { ADMIN } = require('../src/v1/roles/roles');
const testUserCache = require('./api-test-users');
const app = require('../src/createApp');

require('dotenv').config();

const { DTFS_CENTRAL_API_URL } = process.env;

const [facility] = deal.mockFacilities;

describe('api', () => {
  const mock = new MockAdapter(axios);

  const invalidId = '../../../etc/passwd';
  const validId = '620a1aa095a618b12da38c7b';
  const validNonExistentId = '620a1aa095a6bbbbbbbbb';
  const mockPortalAuditDetails = generatePortalAuditDetails(validId);

  let aUser;

  beforeEach(async () => {
    const testUsers = await testUserCache.initialise(app);
    aUser = testUsers().withRole(ADMIN).one();
  });

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
      const response = await api.updateDeal({ dealId: invalidId, dealUpdate: deal, user: aUser, auditDetails: mockPortalAuditDetails });

      expect(response).toEqual(false);
    });

    it('should return the deal when a valid dealId is provided', async () => {
      mock.onPut(`${DTFS_CENTRAL_API_URL}/v1/portal/deals/${validId}`).reply(200, deal);

      const response = await api.updateDeal({ dealId: validId, dealUpdate: deal, user: aUser, auditDetails: mockPortalAuditDetails });

      expect(response).toEqual(deal);
    });

    it('should return deal when a non-existent dealId is provided', async () => {
      const response = await api.updateDeal({ dealId: validNonExistentId, dealUpdate: deal, user: aUser, auditDetails: mockPortalAuditDetails });

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
      const response = await api.addDealComment(invalidId, deal, {}, mockPortalAuditDetails);

      expect(response).toEqual(false);
    });

    it('should return an object when a valid dealId is provided', async () => {
      const success = { success: true };

      mock.onPost(`${DTFS_CENTRAL_API_URL}/v1/portal/deals/${validId}/comment`).reply(200, success);

      const response = await api.addDealComment(validId, undefined, undefined, mockPortalAuditDetails);

      expect(response).toEqual(success);
    });

    it('should return false when a non-existent dealId is provided', async () => {
      const response = await api.addDealComment(validNonExistentId, deal, {}, mockPortalAuditDetails);

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
      const response = await api.updateFacility(invalidId, facility, aUser);

      expect(response).toEqual(false);
    });

    it('should return a status of 200 when a valid facilityId is provided', async () => {
      mock.onPut(`${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${validId}`).reply(200, facility);

      const response = await api.updateFacility(validId, facility, aUser);

      expect(response.status).toEqual(200);
    });

    it('should return false when a non-existent facilityId is provided', async () => {
      const response = await api.updateFacility(validNonExistentId, facility, aUser);

      expect(response).toEqual(false);
    });
  });

  describe('deleteFacility', () => {
    it('should return false when an invalid facilityId is provided', async () => {
      const response = await api.deleteFacility(invalidId, aUser);

      expect(response).toEqual(false);
    });

    it('should return a status of 200 when a valid facilityId is provided', async () => {
      mock.onDelete(`${DTFS_CENTRAL_API_URL}/v1/portal/facilities/${validId}`).reply(200, facility);

      const response = await api.deleteFacility(validId, aUser);

      expect(response.status).toEqual(200);
    });

    it('should return false when a non-existent facilityId is provided', async () => {
      const response = await api.deleteFacility(validNonExistentId, aUser);

      expect(response).toEqual(false);
    });
  });
});
