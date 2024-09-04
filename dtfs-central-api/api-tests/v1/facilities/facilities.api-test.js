import { generateParsedMockAuditDatabaseRecord } from '@ukef/dtfs2-common/change-stream/test-helpers';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import * as wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import aDeal from '../deal-builder';
import { MOCK_DEAL } from '../mocks/mock-data';
import { MOCK_PORTAL_USER } from '../../mocks/test-users/mock-portal-user';
import { createDeal } from '../../helpers/create-deal';
import { createFacility } from '../../helpers/create-facility';
import { withValidateAuditDetailsTests } from '../../helpers/with-validate-audit-details.api-tests';

const mockFacility = {
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
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });

    dealId = deal._id;
    mockFacility.dealId = dealId;
  });

  describe('GET /v1/portal/facilities/', () => {
    it('returns multiple facilities', async () => {
      await createFacility({ facility: mockFacility, user: MOCK_PORTAL_USER });
      await createFacility({ facility: mockFacility, user: MOCK_PORTAL_USER });
      await createFacility({ facility: mockFacility, user: MOCK_PORTAL_USER });

      const { status, body } = await testApi.get('/v1/portal/facilities');

      expect(status).toEqual(200);
      expect(body.length).toEqual(3);
    });

    it('returns 200 with empty array when there are no facilities', async () => {
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES]);
      const { status, body } = await testApi.get('/v1/portal/facilities');

      expect(status).toEqual(200);
      expect(body.length).toEqual(0);
    });
  });

  describe('POST /v1/portal/multiple-facilities', () => {
    const facilities = [mockFacility, mockFacility, mockFacility, mockFacility];

    beforeEach(async () => {
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES]);
    });

    withValidateAuditDetailsTests({
      makeRequest: (auditDetails) => {
        return testApi
          .post({
            facilities,
            user: MOCK_PORTAL_USER,
            dealId,
            auditDetails,
          })
          .to('/v1/portal/multiple-facilities');
      },
    });

    it('updates the audit record', async () => {
      const auditDetails = generatePortalAuditDetails(MOCK_PORTAL_USER._id);
      const postBody = {
        facilities,
        user: MOCK_PORTAL_USER,
        dealId,
        auditDetails,
      };

      const { status, body } = await testApi.post(postBody).to('/v1/portal/multiple-facilities');
      expect(status).toEqual(200);
      expect(body.length).toEqual(4);

      const createdFacilities = await Promise.all(
        body.map(async (facilityId) => {
          const { body: facility } = await testApi.get(`/v1/portal/facilities/${facilityId}`);
          return facility;
        }),
      );

      createdFacilities.forEach((facility) => {
        expect(facility.auditRecord).toEqual(generateParsedMockAuditDatabaseRecord(auditDetails));
      });
    });

    it('creates and returns multiple facilities with createdDate and updatedAt', async () => {
      const postBody = {
        facilities,
        user: MOCK_PORTAL_USER,
        dealId,
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      };

      const { status, body } = await testApi.post(postBody).to('/v1/portal/multiple-facilities');

      expect(status).toEqual(200);
      expect(body.length).toEqual(4);

      const facilityId = body[0];
      const { body: facilityAfterCreation } = await testApi.get(`/v1/portal/facilities/${facilityId}`);

      expect(typeof facilityAfterCreation.createdDate).toEqual('number');
      expect(typeof facilityAfterCreation.updatedAt).toEqual('number');
    });

    it('returns 400 where user is missing', async () => {
      const postBody = {
        facilities,
        dealId,
      };

      const { status } = await testApi.post(postBody).to('/v1/portal/multiple-facilities');

      expect(status).toEqual(404);
    });

    it('returns 400 where deal is not found', async () => {
      const postBody = {
        facilities,
        dealId: '61e54dd5b578247e14575880',
        user: MOCK_PORTAL_USER,
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      };

      const { status } = await testApi.post(postBody).to('/v1/portal/multiple-facilities');

      expect(status).toEqual(404);
    });
  });
});
