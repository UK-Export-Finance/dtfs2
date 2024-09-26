const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const app = require('../../../src/createApp');
const { createApi } = require('../../api');

const { post } = createApi(app);

/**
 * TODO: DTFS2-7419 Ensure `asString` usage as normal
 */
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  asString: (value) => String(value),
}));

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
    auditDetails: generateTfmAuditDetails('abcdef123456abcdef123456'),
  };

  describe('POST /v1/feedback', () => {
    it('successfully sends feedback form', async () => {
      const { status } = await post(feedbackFormBody).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('does not create a feedback when there are validation errors', async () => {
      const { status } = await post({}).to('/v1/feedback');
      expect(status).toEqual(400);
    });
  });
});
