const { MONGO_DB_COLLECTIONS, AUDIT_USER_TYPES, FACILITY_TYPE } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const wipeDB = require('../../../wipeDB');
const { testApi } = require('../../../test-api');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const { DEALS } = require('../../../../src/constants');
const DEFAULTS = require('../../../../src/v1/defaults');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../../helpers/create-deal');
const { createFacility } = require('../../../helpers/create-facility');

const newDeal = {
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
  bankInternalRefName: 'Test',
  additionalRefName: 'Test',
  details: {
    submissionCount: 1,
  },
};

const newFacility = {
  type: FACILITY_TYPE.BOND,
};

describe('/v1/tfm/deals/submit - BSS/EWCS deal', () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  it('400s for an invalid id', async () => {
    const { status } = await testApi
      .put({
        dealType: DEALS.DEAL_TYPE.BSS_EWCS,
        dealId: 'invalid',
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      })
      .to('/v1/tfm/deals/submit');
    expect(status).toEqual(400);
  });

  it('404s for an unknown id', async () => {
    const invalidDealId = '61e54e2e532cf2027303e001';

    const { status } = await testApi
      .put({
        dealType: DEALS.DEAL_TYPE.BSS_EWCS,
        dealId: invalidDealId,
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      })
      .to('/v1/tfm/deals/submit');
    expect(status).toEqual(404);
  });

  describe('when a valid deal exists', () => {
    let dealId;

    beforeEach(async () => {
      const { body: createDealBody } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });

      dealId = createDealBody._id;
    });

    withValidateAuditDetailsTests({
      makeRequest: (auditDetails) => testApi.put({ auditDetails, dealType: DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit'),
      validUserTypes: [AUDIT_USER_TYPES.PORTAL],
    });

    it('returns dealSnapshot with tfm object', async () => {
      const auditDetails = generatePortalAuditDetails(MOCK_PORTAL_USER._id);
      const { status, body } = await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails,
        })
        .to('/v1/tfm/deals/submit');

      expect(status).toEqual(200);

      const { body: dealAfterCreation } = await testApi.get(`/v1/portal/deals/${dealId}`);

      const expected = {
        _id: dealId,
        dealSnapshot: {
          ...dealAfterCreation.deal,
          facilities: [],
        },
        tfm: DEFAULTS.DEAL_TFM,
        auditRecord: generateParsedMockAuditDatabaseRecord(auditDetails),
      };

      expect(body).toEqual(expected);
    });

    it('creates facility snapshots and tfm object', async () => {
      // create facilities
      const newFacility1 = { ...newFacility, dealId };
      const newFacility2 = { ...newFacility, dealId };

      const { body: facility1Body, auditDetails: facility1AuditDetails } = await createFacility({ facility: newFacility1, user: MOCK_PORTAL_USER });

      const { body: facility2Body, auditDetails: facility2AuditDetails } = await createFacility({ facility: newFacility2, user: MOCK_PORTAL_USER });

      const facility1Id = facility1Body._id;
      const facility2Id = facility2Body._id;

      // submit deal
      const auditDetails = generatePortalAuditDetails(MOCK_PORTAL_USER._id);
      const { status } = await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails,
        })
        .to('/v1/tfm/deals/submit');

      expect(status).toEqual(200);

      // get the facilities in tfm
      const facility1 = await testApi.get(`/v1/tfm/facilities/${facility1Id}`);

      expect(facility1.status).toEqual(200);
      expect(facility1.body).toEqual({
        _id: facility1Id,
        facilitySnapshot: {
          _id: facility1Id,
          ...newFacility1,
          createdDate: expect.any(Number),
          updatedAt: expect.any(Number),
          auditRecord: generateParsedMockAuditDatabaseRecord(facility1AuditDetails),
        },
        tfm: DEFAULTS.FACILITY_TFM,
        auditRecord: generateParsedMockAuditDatabaseRecord(auditDetails),
      });

      const facility2 = await testApi.get(`/v1/tfm/facilities/${facility2Id}`);

      expect(facility2.status).toEqual(200);
      expect(facility2.body).toEqual({
        _id: facility2Id,
        facilitySnapshot: {
          _id: facility2Id,
          ...newFacility2,
          createdDate: expect.any(Number),
          updatedAt: expect.any(Number),
          auditRecord: generateParsedMockAuditDatabaseRecord(facility2AuditDetails),
        },
        tfm: DEFAULTS.FACILITY_TFM,
        auditRecord: generateParsedMockAuditDatabaseRecord(auditDetails),
      });
    });
  });
});
