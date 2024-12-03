const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');

const databaseHelper = require('../../database-helper');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');

const { as } = require('../../api')(app);

const dealCommentsController = require('../../../src/v1/controllers/deal-comments.controller');
const { MAKER } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

describe('deal comments controller', () => {
  let aBarclaysMaker;
  let dealId;
  let user;

  const myComment = 'My comment';

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    const barclaysMakers = testUsers().withRole(MAKER).withBankName('Barclays Bank').all();
    [aBarclaysMaker] = barclaysMakers;
  });

  beforeEach(async () => {
    const { body } = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');
    dealId = body._id;
    user = {
      username: aBarclaysMaker.username,
    };
  });

  afterEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
  });

  it('should update a comment', async () => {
    const auditDetails = generatePortalAuditDetails(aBarclaysMaker._id);
    const expectedAuditRecord = generateParsedMockAuditDatabaseRecord(auditDetails);
    const addedComment = await dealCommentsController.addComment(dealId, myComment, user, auditDetails);

    expect(addedComment.comments[0].text).toEqual(myComment);
    expect(addedComment.comments[0].user.username).toEqual(user.username);
    expect(addedComment.auditRecord).toEqual(expectedAuditRecord);
  });
});
