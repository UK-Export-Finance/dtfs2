const app = require('../../../src/createApp');
const api = require('../../api')(app);

describe('/feedback', () => {
  const allFeedbackFields = {
    role: 'computers',
    team: 'Test ltd',
    whyUsingService: 'test',
    easyToUse: 'Very good',
    satisfied: 'Very satisfied',
    howCanWeImprove: 'Devs are doing a great job already',
    emailAddress: 'test@testing.com',
  };

  const postFeedback = async (body) => {
    const response = await api.post(body).to('/v1/feedback');
    return response;
  };

  describe('POST /v1/feedback', () => {
    it('returns 400 with validation errors', async () => {
      const { status, body } = await postFeedback();

      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(5);
      expect(body.validationErrors).toBeDefined();
    });

    describe('role', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            role: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.role).toBeDefined();
          expect(body.validationErrors.errorList.role.text).toEqual('Enter your role');
        });
      });
    });

    describe('team', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            team: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.team).toBeDefined();
          expect(body.validationErrors.errorList.team.text).toEqual('Enter which team you work for');
        });
      });
    });

    describe('whyUsingService', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            whyUsingService: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.whyUsingService).toBeDefined();
          expect(body.validationErrors.errorList.whyUsingService.text).toEqual('Enter your reason for using this service today');
        });
      });
    });

    describe('easyToUse', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            easyToUse: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.easyToUse).toBeDefined();
          expect(body.validationErrors.errorList.easyToUse.text).toEqual('Select a rating for how easy the service is to use');
        });
      });
    });

    describe('satisfied', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            satisfied: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.satisfied).toBeDefined();
          expect(body.validationErrors.errorList.satisfied.text).toEqual('Select a rating for how satisfied you are with the service');
        });
      });
    });

    describe('emailAddress', () => {
      describe('when invalid', () => {
        it('should return validationError', async () => {
          const postInvalidEmail = async (emailAddress) => {
            const feedback = {
              ...allFeedbackFields,
              emailAddress,
            };
            const { body } = await postFeedback(feedback);
            return body.validationErrors;
          };

          const expectedText = 'Enter an email address in the correct format, like name@example.com';

          let validationErrors = await postInvalidEmail('hello');
          expect(validationErrors.errorList.emailAddress.text).toEqual(expectedText);

          validationErrors = await postInvalidEmail('hello@');
          expect(validationErrors.errorList.emailAddress.text).toEqual(expectedText);

          validationErrors = await postInvalidEmail('hello@test');
          expect(validationErrors.errorList.emailAddress.text).toEqual(expectedText);

          validationErrors = await postInvalidEmail('hello@test.');
          expect(validationErrors.errorList.emailAddress.text).toEqual(expectedText);
        });
      });
    });
  });
});
