import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { withMongoIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import * as wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import aDeal from '../../deal-builder';
import { DEALS } from '../../../../src/constants';
import { MOCK_DEAL } from '../../mocks/mock-data';
import { MOCK_PORTAL_USER } from '../../../mocks/test-users/mock-portal-user';
import { createDeal } from '../../../helpers/create-deal';
import { createFacility } from '../../../helpers/create-facility';

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

describe('/v1/tfm/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('GET /v1/tfm/facilities/:id', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/facilities/:id',
      makeRequest: (url) => testApi.get(url),
    });

    it('returns the requested resource', async () => {
      const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      const newId = postResult.body._id;

      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await testApi.get(`/v1/tfm/facilities/${newId}`);

      expect(status).toEqual(200);
      expect(body._id).toEqual(newId);

      expect(typeof body.facilitySnapshot.createdDate).toEqual('number');
    });
  });
});
