import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { generateParsedMockAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import * as wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import aDeal from '../deal-builder';
import { DEALS } from '../../../src/constants';
import { MOCK_DEAL } from '../mocks/mock-data';
import { MOCK_PORTAL_USER } from '../../mocks/test-users/mock-portal-user';
import { createDeal } from '../../helpers/create-deal';
import { createFacility } from '../../helpers/create-facility';
import { withValidateAuditDetailsTests } from '../../helpers/with-validate-audit-details.api-tests';

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

describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });

    dealId = deal._id;
    newFacility.dealId = dealId;
  });

  describe('PUT /v1/portal/facilities/:id', () => {
    let createdFacility;
    let aValidUpdateRequest;
    const auditDetails = generatePortalAuditDetails(MOCK_PORTAL_USER._id);
    const expectedAuditRecord = generateParsedMockAuditDatabaseRecord(auditDetails);

    beforeEach(async () => {
      ({ body: createdFacility } = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER }));
      aValidUpdateRequest = {
        facilityUpdate: { ...createdFacility, value: 123456 },
        user: MOCK_PORTAL_USER,
        auditDetails,
      };
    });

    withValidateAuditDetailsTests({
      makeRequest: async (auditDetailsToUse) => {
        const facilityUpdate = {
          facilityUpdate: { ...createdFacility },
          user: MOCK_PORTAL_USER,
          auditDetails: auditDetailsToUse,
        };

        return testApi.put(facilityUpdate).to(`/v1/portal/facilities/${createdFacility._id}`);
      },
    });

    it('saves audit record to the facility', async () => {
      const { body, status } = await testApi.put(aValidUpdateRequest).to(`/v1/portal/facilities/${createdFacility._id}`);

      expect(status).toEqual(200);
      expect(body.auditRecord).toEqual(expectedAuditRecord);
    });

    it('returns 404 when adding facility to non-existent deal', async () => {
      const aValidButIncorrectDealId = new ObjectId();
      const { status } = await testApi.put(aValidUpdateRequest).to(`/v1/portal/facilities/${aValidButIncorrectDealId}`);

      expect(status).toEqual(404);
    });

    it('returns the updated facility', async () => {
      const { body, status } = await testApi.put(aValidUpdateRequest).to(`/v1/portal/facilities/${createdFacility._id}`);

      expect(status).toEqual(200);
      expect(typeof body.updatedAt).toEqual('number');
      expect(body.value).toEqual(aValidUpdateRequest.facilityUpdate.value);
    });

    it('updates the facility', async () => {
      await testApi.put(aValidUpdateRequest).to(`/v1/portal/facilities/${createdFacility._id}`);

      const { body } = await testApi.get(`/v1/portal/facilities/${createdFacility._id}`);

      expect(typeof body.updatedAt).toEqual('number');
      expect(body.value).toEqual(aValidUpdateRequest.facilityUpdate.value);
    });

    it('updates `editedBy` in the associated deal', async () => {
      const getDealResponse = await testApi.get(`/v1/portal/deals/${newFacility.dealId}`);
      expect(getDealResponse.body.deal.editedBy.length).toEqual(1);

      await testApi.put(aValidUpdateRequest).to(`/v1/portal/facilities/${createdFacility._id}`);

      const { body } = await testApi.get(`/v1/portal/deals/${newFacility.dealId}`);
      expect(body.deal.editedBy.length).toEqual(2);
      expect(body.deal.editedBy[1].userId).toEqual(aValidUpdateRequest.user._id);
      expect(body.deal.editedBy[1].bank).toEqual(aValidUpdateRequest.user.bank);
      expect(body.deal.editedBy[1].roles).toEqual(aValidUpdateRequest.user.roles);
      expect(body.deal.editedBy[1].username).toEqual(aValidUpdateRequest.user.username);
      expect(typeof body.deal.editedBy[1].date).toEqual('number');
    });

    it('updates the facility when no req.body.user is provided', async () => {
      const updatedFacility = {
        facilityUpdate: { ...createdFacility, value: 123456 },
        auditDetails,
      };

      await testApi.put(updatedFacility).to(`/v1/portal/facilities/${createdFacility._id}`);

      const { body } = await testApi.get(`/v1/portal/facilities/${createdFacility._id}`);

      expect(body.value).toEqual(updatedFacility.facilityUpdate.value);
    });
  });

  describe('PUT /v1/portal/facilities/:id/status', () => {
    it('returns 404 when facility does not exist', async () => {
      const { status } = await testApi.put({}).to('/v1/tfm/facilities/61e54e2e532cf2027303e001');

      expect(status).toEqual(404);
    });
  });
});
