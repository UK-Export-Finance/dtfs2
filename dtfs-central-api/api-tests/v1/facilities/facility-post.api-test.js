import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import * as wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import aDeal from '../deal-builder';
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
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  editedBy: [],
  dealType: 'GEF',
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

describe('/v1/portal/facilities', () => {
  describe('POST /v1/portal/facilities', () => {
    let dealId;

    beforeEach(async () => {
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
      const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });

      dealId = deal._id;
      newFacility.dealId = dealId;
    });

    afterAll(async () => {
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
    });

    withValidateAuditDetailsTests({
      makeRequest: async (auditDetails) => await testApi.post({ facility: newFacility, user: MOCK_PORTAL_USER, auditDetails }).to('/v1/portal/facilities'),
    });

    it('returns 404 when associatedDeal/dealId is not found', async () => {
      const facilityWithInvalidDealId = {
        dealId: MOCK_DEAL.DEAL_ID,
        type: 'Bond',
      };

      const { status } = await createFacility({ facility: facilityWithInvalidDealId, user: MOCK_PORTAL_USER });

      expect(status).toEqual(404);
    });

    it('returns 404 when user is not found', async () => {
      const facilityWithInvalidDealId = {
        dealId: MOCK_DEAL.DEAL_ID,
        type: 'Bond',
      };

      const { status } = await testApi.post({ facility: facilityWithInvalidDealId }).to('/v1/portal/facilities');
      expect(status).toEqual(404);
    });

    it('creates a facility with correct fields', async () => {
      const { body, status } = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });

      expect(status).toEqual(200);
      expect(typeof body._id).toEqual('string');

      const { body: facilityAfterCreation } = await testApi.get(`/v1/portal/facilities/${body._id}`);

      expect(facilityAfterCreation.type).toEqual(newFacility.type);
      expect(facilityAfterCreation.dealId).toEqual(newFacility.dealId);
      expect(typeof facilityAfterCreation.createdDate).toEqual('number');
      expect(typeof facilityAfterCreation.updatedAt).toEqual('number');
    });

    it('adds the facility id to the associated deal', async () => {
      const createdFacilityResponse = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      expect(createdFacilityResponse.status).toEqual(200);

      const createdFacility = createdFacilityResponse.body;

      const { status, body } = await testApi.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.facilities).toEqual([createdFacility._id]);
    });

    it('updates `editedBy` in the associated deal', async () => {
      const originalDeal = await testApi.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);
      await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });

      const { status, body } = await testApi.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(status).toEqual(200);

      expect(body.deal.editedBy[0].userId).toEqual(MOCK_PORTAL_USER._id);
      expect(body.deal.editedBy[0].bank).toEqual(MOCK_PORTAL_USER.bank);
      expect(body.deal.editedBy[0].roles).toEqual(MOCK_PORTAL_USER.roles);
      expect(body.deal.editedBy[0].username).toEqual(MOCK_PORTAL_USER.username);
      expect(typeof body.deal.editedBy[0].date).toEqual('number');
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          type: '',
          dealId: '',
        };

        const { body, status } = await createFacility({ facility: postBody, user: MOCK_PORTAL_USER });

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(2);

        expect(body.validationErrors.errorList.type).toBeDefined();
        expect(body.validationErrors.errorList.type.text).toEqual('Enter the Facility type');

        expect(body.validationErrors.errorList.dealId).toBeDefined();
        expect(body.validationErrors.errorList.dealId.text).toEqual('Enter the Associated deal id');
      });
    });

    describe('when required fields are invalid', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          type: 'invalid-facility',
          dealId: MOCK_DEAL.DEAL_ID,
          user: {},
        };

        const { body, status } = await createFacility({ facility: postBody, user: MOCK_PORTAL_USER });

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.type).toBeDefined();
        expect(body.validationErrors.errorList.type.text).toEqual('Facility type must be Bond or Loan');
      });
    });
  });
});
