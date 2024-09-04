import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { generateParsedMockAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import * as wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import { DEALS } from '../../../../src/constants';
import { MOCK_PORTAL_USER } from '../../../mocks/test-users/mock-portal-user';
import { MOCK_TFM_USER } from '../../../mocks/test-users/mock-tfm-user';

const newDeal = {
  dealType: DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
  submissionCount: 0,
};

describe('/v1/tfm/deal/:id', () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  describe('GET /v1/tfm/deals/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await testApi.post(newDeal).to('/v1/portal/gef/deals');
      const dealId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.GEF,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await testApi.get(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.dealSnapshot).toMatchObject(newDeal);
    });
  });

  describe('PUT /v1/tfm/deal/:id/snapshot', () => {
    it('400s if invalid deal id', async () => {
      const { status, body } = await testApi.put({}).to('/v1/tfm/deals/test/snapshot');
      expect(status).toEqual(400);
      expect(body.message).toEqual('Invalid Deal Id');
    });

    it('400s if invalid user id', async () => {
      const { status } = await testApi.put({}).to('/v1/tfm/deals/61e54e2e532cf2027303e001/snapshot');
      expect(status).toEqual(400);
    });

    it('404s if updating an unknown id', async () => {
      // TODO: refactor this as MOCK_USER
      const { status, body } = await testApi
        .put({ auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id) })
        .to('/v1/tfm/deals/61e54e2e532cf2027303e001/snapshot');
      expect(status).toEqual(404);
      expect(body.message).toEqual('Deal not found');
    });

    it('updates deal.dealSnapshot whilst retaining deal.tfm', async () => {
      const { body: createDealBody } = await testApi.post(newDeal).to('/v1/portal/gef/deals');
      const dealId = createDealBody._id;

      const mockTfm = {
        tfm: {
          submissionDetails: {
            exporterPartyUrn: '12345',
          },
        },
      };
      const auditDetails = generatePortalAuditDetails(MOCK_PORTAL_USER._id);
      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.GEF,
          dealId,
          auditDetails,
        })
        .to('/v1/tfm/deals/submit');

      // add some dummy data to deal.tfm
      await testApi
        .put({
          dealUpdate: mockTfm,
          auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
        })
        .to(`/v1/tfm/deals/${dealId}`);

      const snapshotUpdate = {
        snapshotUpdate: {
          someNewField: true,
          testing: true,
        },
        auditDetails,
      };

      const { status, body } = await testApi.put(snapshotUpdate).to(`/v1/tfm/deals/${dealId}/snapshot`);

      expect(status).toEqual(200);
      expect(body.dealSnapshot).toMatchObject({
        ...newDeal,
        ...snapshotUpdate.snapshotUpdate,
      });
      expect(body.tfm).toEqual({
        ...mockTfm.tfm,
        lastUpdated: expect.any(Number),
      });
      expect(body.auditRecord).toEqual(generateParsedMockAuditDatabaseRecord(auditDetails));
    });
  });
});
