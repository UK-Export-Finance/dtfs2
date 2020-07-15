const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/feedback', () => {
  // let noRoles;
  let aBarclaysMaker;

  const feedbackBody = {
    role: 'test role',
    organisation: 'Test ltd',
    reasonForVisiting: 'testing',
    easeOfUse: 'Very good',
    clearlyExplained: 'Good',
    easyToUnderstand: 'Neither good nor poor',
    satisfied: 'Very satisfied',
    howCanWeImprove: 'Devs are doing a great job already',
    email: 'test@testing.com',
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['feedback']);
  });

  const postFeedback = async () => {
    const response = await as(aBarclaysMaker).post(feedbackBody).to('/v1/feedback');
    return response;
  };

  describe('POST /v1/feedback', () => {
    it('returns a new feedback with the provided data', async () => {
      const { status, body } = await postFeedback();

      expect(status).toEqual(200);
      expect(body._id).toBeDefined(); // eslint-disable-line no-underscore-dangle

      const bodyWithoutId = body;
      delete bodyWithoutId._id; // eslint-disable-line no-underscore-dangle
      expect(bodyWithoutId).toEqual(feedbackBody);
    });
  });

  describe('GET /v1/feedback/:id', () => {
    it('404s requests for unknown resources', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/feedback/123456789012');
      expect(status).toEqual(404);
    });

    it('returns a feedback', async () => {
      const createdFeedback = await postFeedback();
      const { _id } = createdFeedback.body; // eslint-disable-line no-underscore-dangle

      const { status, body } = await as(aBarclaysMaker).get(`/v1/feedback/${_id}`);

      expect(status).toEqual(200);

      const bodyWithoutId = body;
      delete bodyWithoutId._id; // eslint-disable-line no-underscore-dangle
      expect(bodyWithoutId).toEqual(feedbackBody);
    });
  });

  describe('DELETE /v1/feedback/:id', () => {
    it('404s requests for unknown resources', async () => {
      const { status } = await as(aBarclaysMaker).remove('/v1/feedback/123456789012');
      expect(status).toEqual(404);
    });
    
    it('deletes feedback', async () => {
      const createdFeedback = await postFeedback();
      const { _id } = createdFeedback.body; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).remove(`/v1/feedback/${_id}`);
      expect(status).toEqual(200);

      const getResponse = await as(aBarclaysMaker).get(`/v1/feedback/${_id}`);
      expect(getResponse.status).toEqual(404);
    });
  });
});
