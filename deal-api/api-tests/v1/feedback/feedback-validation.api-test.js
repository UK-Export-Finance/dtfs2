const moment = require('moment');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/fields/date');

describe('/v1/deals/:id/bond', () => {
  const allFeedbackFields = {
    role: 'computers',
    organisation: 'DTFS2',
    reasonForVisiting: 'submission',
    easeOfUse: 'Very good',
    clearlyExplained: 'Good',
    easyToUnderstand: 'Neither good nor poor',
    satisfied: 'Very satisfied',
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
      expect(body.validationErrors.count).toEqual(7);
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
          expect(body.validationErrors.errorList.role.text).toEqual('Enter What is your role?');
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
          expect(body.validationErrors.errorList.organisation.text).toEqual('Enter Which organisation do you work for?');
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
          expect(body.validationErrors.errorList.reasonForVisiting.text).toEqual('Enter What was your reason for visiting the Beta service today?');
        });
      });
    });

    describe('easeOfUse', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            easeOfUse: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.easeOfUse).toBeDefined();
          expect(body.validationErrors.errorList.easeOfUse.text).toEqual('Enter the Ease of use');
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
          expect(body.validationErrors.errorList.clearlyExplained.text).toEqual('Enter Information required is clearly explained');
        });
      });
    });

    describe('easyToUnderstand', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const feedback = {
            ...allFeedbackFields,
            easyToUnderstand: '',
          };

          const { body } = await postFeedback(feedback);

          expect(body.validationErrors.errorList.easyToUnderstand).toBeDefined();
          expect(body.validationErrors.errorList.easyToUnderstand.text).toEqual('Enter Information required is easy to understand');
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
          expect(body.validationErrors.errorList.satisfied.text).toEqual('Enter Overall, were you satisfied with the Beta service?');
        });
      });
    });
    
    // TODO: email
  });
});
