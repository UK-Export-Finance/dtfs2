const { generatePortalAuditDetails, generateTfmAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-details');
const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
  submissionCount: 0,
};

describe('/v1/tfm/deal/:id', () => {
  beforeEach(async () => {
    await wipeDB.wipe([
      CONSTANTS.DB_COLLECTIONS.DEALS,
      CONSTANTS.DB_COLLECTIONS.FACILITIES,
      CONSTANTS.DB_COLLECTIONS.TFM_DEALS,
      CONSTANTS.DB_COLLECTIONS.TFM_FACILITIES,
    ]);
  });

  describe('GET /v1/tfm/deal/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await api.post(newDeal).to('/v1/portal/gef/deals');
      const dealId = postResult.body._id;

      await api
        .put({
          dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.dealSnapshot).toMatchObject(newDeal);
    });
  });

  describe('PUT /v1/tfm/deal/:id/snapshot', () => {
    it('404s if updating an unknown id', async () => {
      const { status } = await api.put({}).to('/v1/tfm/deals/61e54e2e532cf2027303e001/snapshot');
      expect(status).toEqual(404);
    });

    it('updates deal.dealSnapshot whilst retaining deal.tfm', async () => {
      const { body: createDealBody } = await api.post(newDeal).to('/v1/portal/gef/deals');
      const dealId = createDealBody._id;

      const mockTfm = {
        tfm: {
          submissionDetails: {
            exporterPartyUrn: '12345',
          },
        },
      };

      await api
        .put({
          dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      // add some dummy data to deal.tfm
      await api
        .put({
          dealUpdate: mockTfm,
          auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
        })
        .to(`/v1/tfm/deals/${dealId}`);

      const snapshotUpdate = {
        someNewField: true,
        testing: true,
      };

      const { status, body } = await api.put(snapshotUpdate).to(`/v1/tfm/deals/${dealId}/snapshot`);

      expect(status).toEqual(200);
      expect(body.dealSnapshot).toMatchObject({
        ...newDeal,
        ...snapshotUpdate,
      });
      expect(body.tfm).toEqual({
        ...mockTfm.tfm,
        lastUpdated: expect.any(Number),
      });
      expect(body.auditRecord).toEqual({
        lastUpdatedByTfmUserId: MOCK_TFM_USER._id,
        lastUpdatedAt: expect.any(String),
        lastUpdatedByPortalUserId: null,
        noUserLoggedIn: null,
        lastUpdatedByIsSystem: null,
      });
    });
  });
});
