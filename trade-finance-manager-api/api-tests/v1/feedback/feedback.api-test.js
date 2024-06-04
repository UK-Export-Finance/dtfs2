const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const app = require('../../../src/createApp');
const { post } = require('../../api')(app);

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
    it('it successfully sends feedback form', async () => {
      const { status } = await post(feedbackFormBody).to('/v1/feedback');
      expect(status).toEqual(200);
    });

    it('does not create a feedback when there are validation errors', async () => {
      const { status } = await post({}).to('/v1/feedback');
      expect(status).toEqual(400);
    });
  });
});
