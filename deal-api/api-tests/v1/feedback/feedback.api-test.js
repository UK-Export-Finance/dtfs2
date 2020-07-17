const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/feedback', () => {
  let noRoles;
  let aDataAdmin;
  let aBarclaysMaker;
  let aBarclaysChecker;

  const feedbackBody = {
    role: 'computers',
    organisation: 'Test ltd',
    reasonForVisiting: 'testing',
    easyToUse: 'Very good',
    clearlyExplained: 'Good',
    satisfied: 'Very satisfied',
    howCanWeImprove: 'Devs are doing a great job already',
    emailAddress: 'test@testing.com',
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
    aDataAdmin = testUsers().withRole('data-admin').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['feedback']);
  });

  const postFeedback = async () => {
    const response = await as(aBarclaysMaker).post(feedbackBody).to('/v1/feedback');
    return response;
  };

  describe('POST /v1/feedback', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post({}).to('/v1/feedback');
      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await as(noRoles).post({}).to('/v1/feedback');
      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=maker', async () => {
      const { status } = await as(aBarclaysMaker).post(feedbackBody).to('/v1/feedback');

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const { status } = await as(aBarclaysChecker).post(feedbackBody).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('does not create a feedback when there are validation errors', async () => {
      await as(aBarclaysMaker).post({}).to('/v1/feedback');
      const { status, body } = await as(aDataAdmin).get(`/v1/feedback`);
      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });

    describe('when all required fields provided', () => {
      it('returns a new feedback with added `created` field', async () => {
        const { status, body } = await postFeedback();

        expect(status).toEqual(200);
        expect(body._id).toBeDefined(); // eslint-disable-line no-underscore-dangle

        expect(body).toEqual({
          ...feedbackBody,
          _id: expect.any(String), // eslint-disable-line no-underscore-dangle
          created: expect.any(String),
        });
      });
    });
  });

  describe('GET /v1/feedback', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/feedback');
      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=data-admin', async () => {
      const { status } = await as(noRoles).get('/v1/feedback');
      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=data-admin', async () => {
      const { status } = await as(aDataAdmin).get('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('returns all feedback', async () => {
      const feedback1 = await postFeedback();
      const feedback2 = await postFeedback();
      const feedback3 = await postFeedback();

      const { status, body } = await as(aDataAdmin).get(`/v1/feedback`);

      expect(status).toEqual(200);

      expect(body).toEqual([
        { ...feedback1.body },
        { ...feedback2.body },
        { ...feedback3.body },
      ]);
    });
  });

  describe('GET /v1/feedback/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/feedback/123456789012');
      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=data-admin', async () => {
      const { status } = await as(noRoles).get('/v1/feedback/123456789012');
      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=data-admin', async () => {
      const createdFeedback = await postFeedback();
      const { _id } = createdFeedback.body; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aDataAdmin).get(`/v1/feedback/${_id}`); // eslint-disable-line no-underscore-dangle
      expect(status).toEqual(200);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(aDataAdmin).get('/v1/feedback/123456789012');
      expect(status).toEqual(404);
    });

    it('returns a feedback', async () => {
      const createdFeedback = await postFeedback();
      const { _id } = createdFeedback.body; // eslint-disable-line no-underscore-dangle

      const { status, body } = await as(aDataAdmin).get(`/v1/feedback/${_id}`);

      expect(status).toEqual(200);

      expect(body).toEqual({
        ...feedbackBody,
        _id: expect.any(String), // eslint-disable-line no-underscore-dangle
        created: expect.any(String),
      });
    });
  });

  describe('DELETE /v1/feedback/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/feedback/123456789012');
      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=data-admin', async () => {
      const { status } = await as(noRoles).remove('/v1/feedback/123456789012');
      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=data-admin', async () => {
      const createdFeedback = await postFeedback();
      const { _id } = createdFeedback.body; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aDataAdmin).remove(`/v1/feedback/${_id}`); // eslint-disable-line no-underscore-dangle
      expect(status).toEqual(200);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(aDataAdmin).remove('/v1/feedback/123456789012');
      expect(status).toEqual(404);
    });
    
    it('deletes feedback', async () => {
      const createdFeedback = await postFeedback();
      const { _id } = createdFeedback.body; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aDataAdmin).remove(`/v1/feedback/${_id}`);
      expect(status).toEqual(200);

      const getResponse = await as(aDataAdmin).get(`/v1/feedback/${_id}`);
      expect(getResponse.status).toEqual(404);
    });
  });
});
