const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');

const databaseHelper = require('../../database-helper');

const app = require('../../../server/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');

const { as } = require('../../api')(app);

const dealCommentsController = require('../../../server/v1/controllers/deal-comments.controller');
const { MAKER } = require('../../../server/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

describe('deal comments controller', () => {
  let testbank1Maker;
  let dealId;
  let user;

  const myComment = 'My comment';

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    const testbank1Makers = testUsers().withRole(MAKER).withBankName('Bank 1').all();
    [testbank1Maker] = testbank1Makers;
  });

  beforeEach(async () => {
    const { body } = await as(testbank1Maker).post(completedDeal).to('/v1/deals');
    dealId = body._id;
    user = {
      username: testbank1Maker.username,
    };
  });

  afterEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
  });

  it('should update a comment', async () => {
    const auditDetails = generatePortalAuditDetails(testbank1Maker._id);
    const expectedAuditRecord = generateParsedMockAuditDatabaseRecord(auditDetails);
    const addedComment = await dealCommentsController.addComment(dealId, myComment, user, auditDetails);

    expect(addedComment.comments[0].text).toEqual(myComment);
    expect(addedComment.comments[0].user.username).toEqual(user.username);
    expect(addedComment.auditRecord).toEqual(expectedAuditRecord);
  });
});
