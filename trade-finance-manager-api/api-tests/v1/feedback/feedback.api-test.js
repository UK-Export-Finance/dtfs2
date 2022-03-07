const app = require('../../../src/createApp');
const api = require('../../api')(app);

describe('/feedback', () => {
  const feedbackFormBody = {
    role: 'computers',
    team: 'Test ltd',
    whyUsingService: 'test',
    easyToUse: 'Very good',
    satisfied: 'Very satisfied',
    howCanWeImprove: 'Devs are doing a great job already',
    emailAddress: 'test@testing.com',
  };

  describe('POST /v1/feedback', () => {
    it('200s requests that do not present a valid Authorization token', async () => {
      const { status } = await api.post(feedbackFormBody).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('200s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await api.post(feedbackFormBody).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=maker', async () => {
      const { status } = await api.post(feedbackFormBody).to('/v1/feedback');

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const { status } = await api.post(feedbackFormBody).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('does not create a feedback when there are validation errors', async () => {
      await api.post({}).to('/v1/feedback');
      const { status } = await api.post({}).to('/v1/feedback');
      expect(status).toEqual(400);
    });
  });
});
