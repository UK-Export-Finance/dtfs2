const { MONGO_DB_COLLECTIONS, AMENDMENT_STATUS, CURRENCY } = require('@ukef/dtfs2-common');
const { generateTfmAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { withMongoIdPathParameterValidationTests } = require('@ukef/dtfs2-common/test-cases-backend');
const wipeDB = require('../../../wipeDB');
const { testApi } = require('../../../test-api');
const { DEALS } = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');
const { createDeal } = require('../../../helpers/create-deal');
const { createFacility } = require('../../../helpers/create-facility');

describe('GET TFM amendments', () => {
  let dealId;

  const newFacility = {
    type: 'Bond',
    dealId: MOCK_DEAL.DEAL_ID,
  };

  const newDeal = aDeal({
    dealType: DEALS.DEAL_TYPE.BSS_EWCS,
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    editedBy: [],
    eligibility: {
      status: 'Not started',
      criteria: [{}],
    },
  });

  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS]);
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('GET /v1/tfm/facilities/:id/amendments', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/facilities/:id/amendments',
      makeRequest: (url) => testApi.get(url),
    });

    it('should return all amendments based on facilityId', async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const facilityId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { body: bodyPostResponse } = await testApi
        .post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to(`/v1/tfm/facilities/${facilityId}/amendments`);
      const updatePayload = { status: AMENDMENT_STATUS.IN_PROGRESS };
      await testApi
        .put({ payload: updatePayload, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to(`/v1/tfm/facilities/${facilityId}/amendments/${bodyPostResponse.amendmentId}`);

      const { status, body } = await testApi.get(`/v1/tfm/facilities/${facilityId}/amendments`);

      expect(status).toEqual(200);

      const exp = [
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          status: expect.any(String),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 1,
        },
      ];

      expect(body).toEqual(exp);
    });

    it('should return 200 with an empty array if the facility does not have any amendments', async () => {
      const { status, body } = await testApi.get('/v1/tfm/facilities/626a9270184ded001357c010/amendments');
      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendments/:amendmentId', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/facilities/:id/amendments/:amendmentId',
      makeRequest: (url) => testApi.get(url),
    });

    it('should return 200 status if the facility has amendments', async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const facilityId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const {
        body: { amendmentId },
      } = await testApi.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);
      const { status, body } = await testApi.get(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`);

      expect(status).toEqual(200);
      expect(body).toEqual({
        amendmentId: expect.any(String),
        createdAt: expect.any(Number),
        status: expect.any(String),
        updatedAt: expect.any(Number),
        dealId: expect.any(String),
        facilityId: expect.any(String),
        version: 1,
      });
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendments/in-progress', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/facilities/:id/amendments/in-progress',
      makeRequest: (url) => testApi.get(url),
    });

    it("should return 200 status if the facility has an amendment that's in progress", async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const facilityId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { body: bodyPostResponse } = await testApi
        .post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to(`/v1/tfm/facilities/${facilityId}/amendments`);
      const updatePayload = { status: AMENDMENT_STATUS.IN_PROGRESS };
      await testApi
        .put({ payload: updatePayload, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to(`/v1/tfm/facilities/${facilityId}/amendments/${bodyPostResponse.amendmentId}`);
      const { status, body } = await testApi.get(`/v1/tfm/facilities/${facilityId}/amendments/in-progress`);

      expect(status).toEqual(200);
      expect(body).toEqual({
        amendmentId: expect.any(String),
        createdAt: expect.any(Number),
        status: expect.any(String),
        updatedAt: expect.any(Number),
        dealId: expect.any(String),
        facilityId: expect.any(String),
        version: 1,
      });
    });

    it("should return 200 status if the facility does NOT have an amendment that's in progress", async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const facilityId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await testApi.get(`/v1/tfm/facilities/${facilityId}/amendments/in-progress`);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendments/completed', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/facilities/:id/amendments/completed',
      makeRequest: (url) => testApi.get(url),
    });

    it("should return 200 status if the facility has an amendment that's COMPLETED", async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const facilityId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const {
        body: { amendmentId },
      } = await testApi.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);
      await testApi
        .put({
          payload: { status: AMENDMENT_STATUS.COMPLETED },
          auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
        })
        .to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`);

      const {
        body: { amendmentId: amendmentId2 },
      } = await testApi.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);
      await testApi
        .put({
          payload: { status: AMENDMENT_STATUS.COMPLETED },
          auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
        })
        .to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId2}`);

      await testApi.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);

      const { status, body } = await testApi.get(`/v1/tfm/facilities/${facilityId}/amendments/completed`);

      expect(status).toEqual(200);
      expect(body).toEqual([
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          status: expect.any(String),
          updatedAt: expect.any(Number),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 1,
        },
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          status: expect.any(String),
          updatedAt: expect.any(Number),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 2,
        },
      ]);
    });

    it("should return 200 status if the facility does NOT have an amendment that's COMPLETED", async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const facilityId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await testApi.get(`/v1/tfm/facilities/${facilityId}/amendments/completed`);

      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendments/completed/latest', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/facilities/:id/amendments/completed/latest',
      makeRequest: (url) => testApi.get(url),
    });

    it("should return 200 status if the facility has an amendment that's COMPLETED", async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const facilityId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const {
        body: { amendmentId },
      } = await testApi.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);
      await testApi
        .put({
          payload: {
            status: AMENDMENT_STATUS.COMPLETED,
            submittedByPim: true,
            requireUkefApproval: false,
            changeFacilityValue: true,
            value: 123,
            currency: CURRENCY.GBP,
          },
          auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
        })
        .to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`);

      const { status, body } = await testApi.get(`/v1/tfm/facilities/${facilityId}/amendments/completed/latest-value`);
      expect(status).toEqual(200);
      expect(body).toEqual({
        amendmentId: expect.any(String),
        value: 123,
        currency: CURRENCY.GBP,
      });
    });

    it("should return 200 status if the facility does NOT have an amendment that's COMPLETED", async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const facilityId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await testApi.get(`/v1/tfm/facilities/${facilityId}/amendments/completed/latest-value`);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });

  describe('GET /v1/tfm/amendments', () => {
    it('should return 200 status and all amendments that are in progress', async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const facilityId1 = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { body: bodyPostResponse1 } = await testApi
        .post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to(`/v1/tfm/facilities/${facilityId1}/amendments`);
      const updatePayload1 = { status: AMENDMENT_STATUS.IN_PROGRESS };
      await testApi
        .put({ payload: updatePayload1, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to(`/v1/tfm/facilities/${facilityId1}/amendments/${bodyPostResponse1.amendmentId}`);

      const postResult2 = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const facilityId2 = postResult2.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { body: bodyPostResponse2 } = await testApi
        .post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to(`/v1/tfm/facilities/${facilityId2}/amendments`);
      const updatePayload2 = { status: AMENDMENT_STATUS.IN_PROGRESS };
      await testApi
        .put({ payload: updatePayload2, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to(`/v1/tfm/facilities/${facilityId2}/amendments/${bodyPostResponse2.amendmentId}`);

      const { status, body } = await testApi.get('/v1/tfm/amendments');

      expect(status).toEqual(200);
      expect(body).toEqual([
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          status: expect.any(String),
          updatedAt: expect.any(Number),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 1,
        },
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          status: expect.any(String),
          updatedAt: expect.any(Number),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 1,
        },
      ]);
    });
  });
});
