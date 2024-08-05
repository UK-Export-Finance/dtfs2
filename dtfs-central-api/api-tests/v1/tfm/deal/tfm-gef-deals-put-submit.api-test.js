const { MONGO_DB_COLLECTIONS, AUDIT_USER_TYPES, FACILITY_TYPE } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const wipeDB = require('../../../wipeDB');
const { testApi } = require('../../../test-api');
const { DEALS } = require('../../../../src/constants');
const DEFAULTS = require('../../../../src/v1/defaults');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');

const newDeal = {
  dealType: DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
  submissionCount: 1,
  exporter: {},
};

const newFacility = {
  type: FACILITY_TYPE.CASH,
};

describe('/v1/tfm/deals/submit - GEF deal', () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  it('400s for an invalid id', async () => {
    const { status } = await testApi
      .put({
        dealType: DEALS.DEAL_TYPE.GEF,
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
        dealType: DEALS.DEAL_TYPE.GEF,
        dealId: invalidDealId,
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      })
      .to('/v1/tfm/deals/submit');
    expect(status).toEqual(404);
  });

  describe('when a valid deal exists', () => {
    let dealId;

    beforeEach(async () => {
      const { body: createDealBody } = await testApi.post(newDeal).to('/v1/portal/gef/deals');
      dealId = createDealBody._id;
    });

    withValidateAuditDetailsTests({
      makeRequest: (auditDetails) => testApi.put({ auditDetails, dealType: DEALS.DEAL_TYPE.GEF, dealId }).to('/v1/tfm/deals/submit'),
      validUserTypes: [AUDIT_USER_TYPES.PORTAL],
    });

    it('returns dealSnapshot with tfm object', async () => {
      const { status, body } = await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.GEF,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      expect(status).toEqual(200);

      const expected = {
        _id: dealId,
        dealSnapshot: {
          _id: dealId,
          ...newDeal,
          facilities: [],
        },
        tfm: DEFAULTS.DEAL_TFM,
        auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
      };
      expect(body).toEqual(expected);
    });

    it('creates facility snapshots and tfm object', async () => {
      // create facilities
      const newFacility1 = { ...newFacility, dealId };
      const newFacility2 = { ...newFacility, dealId };

      const { body: facility1Body } = await testApi.post(newFacility1).to('/v1/portal/gef/facilities');
      const { body: facility2Body } = await testApi.post(newFacility2).to('/v1/portal/gef/facilities');

      const facility1Id = facility1Body._id;
      const facility2Id = facility2Body._id;

      // submit deal
      const { status } = await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.GEF,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
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
        },
        tfm: DEFAULTS.FACILITY_TFM,
        auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
      });

      const facility2 = await testApi.get(`/v1/tfm/facilities/${facility2Id}`);

      expect(facility2.status).toEqual(200);
      expect(facility2.body).toEqual({
        _id: facility2Id,
        facilitySnapshot: {
          _id: facility2Id,
          ...newFacility2,
        },
        tfm: DEFAULTS.FACILITY_TFM,
        auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
      });
    });
  });
});
