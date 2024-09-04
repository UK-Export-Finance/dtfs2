import { MONGO_DB_COLLECTIONS, FACILITY_TYPE, generatePortalAuditDetails } from '@ukef/dtfs2-common';
import * as wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import { DEALS } from '../../../../src/constants';
import { MOCK_PORTAL_USER } from '../../../mocks/test-users/mock-portal-user';

const newDeal = {
  dealType: DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
  exporter: { companyName: 'Mock Company name' },
  hasBeenIssued: true,
};

const newFacility = {
  type: FACILITY_TYPE.CASH,
  dealId: 123,
  ukefFacilityId: '223344',
  value: '2000',
  coverEndDate: '2021-08-12T00:00:00.000Z',
  currency: { id: 'GBP' },
};
describe('/v1/tfm/facilities', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });
  describe('GET /v1/tfm/facilities', () => {
    it('returns the requested resource', async () => {
      // create deal
      const { body: createdDeal } = await testApi.post(newDeal).to('/v1/portal/gef/deals');

      const dealId = createdDeal._id;

      // create some facilities
      newFacility.dealId = dealId;
      await testApi.post(newFacility).to('/v1/portal/gef/facilities');

      // submit deal/facilities
      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.GEF,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      // get facilities after they've been created so we have all the data
      const { body: allFacilitiesAfterCreation } = await testApi.get(
        '/v1/tfm/facilities?page=0&pagesize=20&sortBy[order]=ascending&sortBy[field]=ukefFacilityId',
      );

      const expectedFacilityShape = {
        companyName: expect.any(String),
        tfmFacilities: {
          dealId: expect.any(String),
          ukefFacilityId: expect.any(String),
          facilityId: expect.any(String),
          type: expect.any(String),
          dealType: expect.any(String),
          value: expect.any(String),
          companyName: expect.any(String),
          currency: expect.any(String),
          coverEndDate: expect.any(String),
        },
        ukefFacilityId: expect.any(String),
      };

      expect(allFacilitiesAfterCreation.facilities[0]).toEqual(expectedFacilityShape);
    });
  });
});
