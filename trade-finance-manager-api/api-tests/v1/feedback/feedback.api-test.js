const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');

describe('/feedback', () => {
  const feedbackFormBody = {
    role: 'computers',
    team: 'Test ltd',
    whyUsingService: 'test',
    easyToUse: 'Very good',
    satisfied: 'Very satisfied',
    howCanWeImprove: 'Devs are doing a great job already',
    emailAddress: 'test@testing.com',
    submittedBy: {
      username: 'Tester',
      email: 'test@test.test',
    },
  };

  describe('POST /v1/feedback', () => {
    it('it successfully sends feedback form', async () => {
      const user = await testUserCache.initialise(app);
      const { status } = await as(user).post(feedbackFormBody).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('does not create a feedback when there are validation errors', async () => {
      const user = await testUserCache.initialise(app);
      await as(user).post({}).to('/v1/feedback');
      const { status } = await as(user).post({}).to('/v1/feedback');
      expect(status).toEqual(400);
    });
  });
});
