const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');

const { TestApi } = require('../../test-api');
const CONSTANTS = require('../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../helpers/create-deal');

const newDeal = aDeal({
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  exporter: {
    companyName: 'mock company',
  },
  bankInternalRefName: 'test',
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
  updatedAt: 123456789,
});

describe('/v1/portal/deals', () => {
  beforeAll(async () => {
    await TestApi.initialise();

    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  describe('PUT /v1/portal/deals/:id/status', () => {
    it('Should return 400 bad request status code when the new status is same and existing application status', async () => {
      // Create a new BSS deal
      const dealWithSubmittedStatus = {
        ...newDeal,
        status: 'Submitted',
        previousStatus: "Checker's approval",
      };
      const postResult = await createDeal({ deal: dealWithSubmittedStatus, user: MOCK_PORTAL_USER });
      const createdDeal = postResult.body;

      // First status update - 200
      let statusUpdate = 'Acknowledged';
      const { status } = await TestApi.put({ status: statusUpdate }).to(`/v1/portal/deals/${createdDeal._id}/status`);
      expect(status).toEqual(200);

      // Second status update - 400
      statusUpdate = 'Acknowledged';
      const { status: secondStatus } = await TestApi.put({ status: statusUpdate }).to(`/v1/portal/deals/${createdDeal._id}/status`);
      expect(secondStatus).toEqual(400);
    });

    it('returns the updated deal with updated statuses', async () => {
      const dealWithSubmittedStatus = {
        ...newDeal,
        status: 'Submitted',
        previousStatus: "Checker's approval",
      };

      const postResult = await createDeal({ deal: dealWithSubmittedStatus, user: MOCK_PORTAL_USER });
      const createdDeal = postResult.body;
      const statusUpdate = 'Acknowledged';

      const { status, body } = await TestApi.put({ status: statusUpdate }).to(`/v1/portal/deals/${createdDeal._id}/status`);

      expect(status).toEqual(200);

      expect(body.status).toEqual('Acknowledged');
      expect(body.previousStatus).toEqual('Submitted');
      expect(typeof body.updatedAt).toEqual('number');
    });
  });
});
