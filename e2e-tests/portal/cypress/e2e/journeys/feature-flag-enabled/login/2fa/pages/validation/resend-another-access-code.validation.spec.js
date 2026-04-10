const MOCK_USERS = require('../../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../../access-code-form.shared-test');
const { sharedAccessCodeValidationTests } = require('./validation.shared-test');
const { resendAnotherAccessCode } = require('../../../../../../pages');

context('2FA Page Validation - Resend another access code', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('Validation', () => {
    sharedAccessCodeValidationTests({ page: resendAnotherAccessCode, user: BANK1_MAKER1 });
  });
});
