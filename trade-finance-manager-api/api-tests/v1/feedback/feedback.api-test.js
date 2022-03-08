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
    it('it successfully sends feedback form', async () => {
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
