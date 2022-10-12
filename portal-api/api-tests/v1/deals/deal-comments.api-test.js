const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');

const { as } = require('../../api')(app);

const dealCommentsController = require('../../../src/v1/controllers/deal-comments.controller');

describe('deal comments controller', () => {
  let aBarclaysMaker;
  let dealId;
  let user;

  const myComment = 'My comment';

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    [aBarclaysMaker] = barclaysMakers;
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals', 'facilities']);
    const { body } = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');
    dealId = body._id;
    user = {
      username: aBarclaysMaker.username,
    };
  });

  it('should update a comment', async () => {
    const addedComment = await dealCommentsController.addComment(dealId, myComment, user);

    expect(addedComment.comments[0].text).toEqual(myComment);
    expect(addedComment.comments[0].user.username).toEqual(user.username);
  });

  it('should update a special condition', async () => {
    const addedComment = await dealCommentsController.addUkefDecision(dealId, myComment, user);

    expect(addedComment.ukefDecision[0].text).toEqual(myComment);
    expect(addedComment.ukefDecision[0].user.username).toEqual(user.username);
  });
});
