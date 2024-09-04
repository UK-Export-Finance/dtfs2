import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { generateParsedMockAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { withMongoIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import * as wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import { withValidateAuditDetailsTests } from '../../../helpers/with-validate-audit-details.api-tests';
import aDeal from '../../deal-builder';
import { DEALS } from '../../../../src/constants';
import { MOCK_PORTAL_USER } from '../../../mocks/test-users/mock-portal-user';
import { createDeal } from '../../../helpers/create-deal';
import { MOCK_TFM_USER } from '../../../mocks/test-users/mock-tfm-user';
import { createFacility } from '../../../helpers/create-facility';

const newFacility = {
  type: 'Bond',
  dealId: '123123456',
};

const newDeal = aDeal({
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  details: {
    submissionCount: 0,
  },
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

const portalAuditDetails = generatePortalAuditDetails(MOCK_PORTAL_USER._id);
const tfmAuditDetails = generateTfmAuditDetails(MOCK_TFM_USER._id);

describe('/v1/tfm/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER, auditDetails: portalAuditDetails });

    dealId = deal._id;
    newFacility.dealId = dealId;
  });

  describe('PUT /v1/tfm/facilities/:id', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/facilities/:id',
      makeRequest: (url) => testApi.put({}).to(url),
    });

    it('returns 404 when adding facility to non-existent deal', async () => {
      await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId: '61e54e2e532cf2027303e001',
          auditDetails: portalAuditDetails,
        })
        .to('/v1/tfm/deals/submit');

      const { status } = await testApi
        .put({ facility: newFacility, user: MOCK_PORTAL_USER, auditDetails: tfmAuditDetails })
        .to('/v1/tfm/facilities/61e54e2e532cf2027303e001');

      expect(status).toEqual(404);
    });

    describe('with a valid deal submitted to TFM', () => {
      let createdFacility;

      beforeEach(async () => {
        const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });

        await testApi
          .put({
            dealType: DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: portalAuditDetails,
          })
          .to('/v1/tfm/deals/submit');

        createdFacility = postResult.body;
      });

      withValidateAuditDetailsTests({
        makeRequest: (auditDetails) =>
          testApi.put({ auditDetails, dealType: DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to(`/v1/tfm/facilities/${createdFacility._id}`),
      });

      it('returns the updated facility', async () => {
        const updatedFacility = {
          tfmUpdate: {
            bondIssuerPartyUrn: 'testUrn',
          },
          auditDetails: portalAuditDetails,
        };

        const { body, status } = await testApi.put(updatedFacility).to(`/v1/tfm/facilities/${createdFacility._id}`);

        expect(status).toEqual(200);
        expect(body.tfm).toEqual(updatedFacility.tfmUpdate);
        expect(body.auditRecord).toEqual(generateParsedMockAuditDatabaseRecord(portalAuditDetails));
      });
    });
  });
});
