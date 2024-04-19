const { generatePortalAuditDetails, generateTfmAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-details');
const { generateParsedMockTfmUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/src/test-helpers/generate-mock-audit-database-record');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');

describe('PUT TFM amendments', () => {
  let dealId;

  const newFacility = {
    type: 'Bond',
    dealId: MOCK_DEAL.DEAL_ID,
  };

  const newDeal = aDeal({
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    editedBy: [],
    eligibility: {
      status: 'Not started',
      criteria: [{}],
    },
  });
  const createDeal = async () => {
    const { body } = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
    return body;
  };

  beforeAll(async () => {
    await wipeDB.wipe([CONSTANTS.DB_COLLECTIONS.TFM_FACILITIES, CONSTANTS.DB_COLLECTIONS.TFM_DEALS, CONSTANTS.DB_COLLECTIONS.USERS]);
  });

  beforeEach(async () => {
    const deal = await createDeal();
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('PUT /v1/tfm/facilities/:id/amendments/:amendmentId', () => {
    describe('with a valid facility and amendment', () => {
      let facilityId;
      let amendmentId;

      beforeEach(async () => {
        const postResult = await api.post({ facility: newFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
        facilityId = postResult.body._id;

        await api
          .put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId, auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id) })
          .to('/v1/tfm/deals/submit');

        const { body } = await api.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments/`);
        amendmentId = body.amendmentId;
      });

      withValidateAuditDetailsTests({
        makeRequest: (auditDetails) =>
          api
            .put({ payload: { updatePayload: { createdBy: MOCK_PORTAL_USER } }, auditDetails })
            .to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`),
        validUserTypes: ['tfm'],
      });

      it('should update an amendment based on facilityId and amendmentId', async () => {
        const updatePayload = { createdBy: MOCK_PORTAL_USER };
        const { body: bodyPutResponse } = await api
          .put({ payload: { updatePayload }, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
          .to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`);

        const expected = {
          dealId: expect.any(String),
          facilityId: expect.any(String),
          status: expect.any(String),
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          updatePayload,
          updatedAt: expect.any(Number),
          version: 1,
        };
        expect(bodyPutResponse).toEqual(expected);
      });

      it('should update the auditRecord on the facility document', async () => {
        const updatePayload = { createdBy: MOCK_PORTAL_USER };
        await api
          .put({ payload: { updatePayload }, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
          .to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`);

        const {body: updatedFacility } = await api.get(`/v1/tfm/facilities/${facilityId}`);

        expect(updatedFacility.auditRecord).toEqual(generateParsedMockTfmUserAuditDatabaseRecord(MOCK_TFM_USER._id));
      });
    });

    it('should return 404 if facilityId and amendmentId are valid but are NOT associated to a record', async () => {
      const postResult = await api.post({ facility: newFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      await api
        .put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId, auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id) })
        .to('/v1/tfm/deals/submit');

      const updatePayload = { createdBy: MOCK_PORTAL_USER };
      const { status } = await api.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${newId}/amendments/`);
      const { body: bodyPutResponse } = await api
        .put({ payload: updatePayload, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to(`/v1/tfm/facilities/${newId}/amendments/626aa00e2446022434c52148`);

      expect(status).toEqual(200);
      expect(bodyPutResponse).toEqual({ status: 404, message: 'The amendment does not exist' });
    });

    it('should return 400 if invalid dealId', async () => {
      await api.post({ facility: newFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
      await api
        .put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId, auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id) })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await api
        .put({ payload: { amendmentsUpdate: {} }, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to('/v1/tfm/facilities/123/amendments/1234');
      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility or amendment id' });
    });
  });
});
