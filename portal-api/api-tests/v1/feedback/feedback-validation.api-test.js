const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/deals/:id/bond', () => {
  const allFeedbackFields = {
    role: 'computers',
    organisation: 'Test ltd',
    reasonForVisiting: 'testing',
    easyToUse: 'Very good',
    clearlyExplained: 'Good',
    satisfied: 'Very satisfied',
    howCanWeImprove: 'Devs are doing a great job already',
    emailAddress: 'test@testing.com',
  };

  let aBarclaysMaker;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['feedback']);
  });

  const postFeedback = async (body) => {
    const response = await as(aBarclaysMaker).post(body).to('/v1/feedback');
    return response;
  };

  describe('GET /v1/feedback/:id', () => {
    it('returns 400 with validation errors', async () => {
      const { status, body } = await postFeedback();

      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(6);
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

    describe('organisation', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            organisation: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.organisation).toBeDefined();
          expect(body.validationErrors.errorList.organisation.text).toEqual('Enter which organisation you work for');
        });
      });
    });

    describe('reasonForVisiting', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            reasonForVisiting: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.reasonForVisiting).toBeDefined();
          expect(body.validationErrors.errorList.reasonForVisiting.text).toEqual('Select your reason for visiting the service today');
        });
      });

      describe('when value is `Other` and reasonForVisitingOther is missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            reasonForVisiting: 'Other',
            reasonForVisitingOther: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.reasonForVisitingOther).toBeDefined();
          expect(body.validationErrors.errorList.reasonForVisitingOther.text).toEqual('Enter your reason for visiting the service today');
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

    describe('clearlyExplained', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            clearlyExplained: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.clearlyExplained).toBeDefined();
          expect(body.validationErrors.errorList.clearlyExplained.text).toEqual('Select a rating for how clearly explained the information you need to provide is');
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
