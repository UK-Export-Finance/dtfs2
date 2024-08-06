const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { withMongoIdPathParameterValidationTests } = require('@ukef/dtfs2-common/test-cases-backend');
const { MONGO_DB_COLLECTIONS, FACILITY_TYPE } = require('@ukef/dtfs2-common');
const wipeDB = require('../../../wipeDB');
const { testApi } = require('../../../test-api');
const { DEALS } = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');

const newDeal = {
  dealType: DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
};

const newFacility = {
  type: FACILITY_TYPE.CASH,
  dealId: MOCK_DEAL.DEAL_ID,
};

describe('/v1/tfm/deals/:dealId/facilities', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  describe('GET /v1/tfm/deals/:dealId/facilities', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/deals/:dealId/facilities',
      makeRequest: (url) => testApi.get(url),
    });

    it('returns the requested resource', async () => {
      // create deal
      const { body: createdDeal } = await testApi.post(newDeal).to('/v1/portal/gef/deals');

      const dealId = createdDeal._id;

      // create some facilities
      newFacility.dealId = dealId;
      await testApi.post(newFacility).to('/v1/portal/gef/facilities');
      await testApi.post(newFacility).to('/v1/portal/gef/facilities');

      // submit deal/facilities
      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.GEF,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status, body } = await testApi.get(`/v1/tfm/deals/${dealId}/facilities`);

      expect(status).toEqual(200);

      // get facilities after they've been created so we have all the data
      const { body: allFacilitiesAfterCreation } = await testApi.get(`/v1/portal/gef/deals/${dealId}/facilities`);

      const expectedFacilityShape = (facility) => ({
        _id: facility._id,
        facilitySnapshot: {
          _id: facility._id,
          ...newFacility,
        },
        auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
      });

      // assert all facilities returned from GET against the created facilities
      const facility1 = body.find((f) => f._id === allFacilitiesAfterCreation[0]._id);
      const facility2 = body.find((f) => f._id === allFacilitiesAfterCreation[1]._id);

      expect(facility1).toEqual(expectedFacilityShape(facility1));
      expect(facility2).toEqual(expectedFacilityShape(facility2));
    });
  });
});
