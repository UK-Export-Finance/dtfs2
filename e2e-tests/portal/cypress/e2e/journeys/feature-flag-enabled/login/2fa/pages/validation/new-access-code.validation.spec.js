const MOCK_USERS = require('../../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('../../access-code-form.shared-test');
const { sharedAccessCodeValidationTests } = require('./validation.shared-test');
const { newAccessCode } = require('../../../../../../pages');

context('2FA Page Validation - New access code', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
  });

  describe('Validation', () => {
    sharedAccessCodeValidationTests({ page: newAccessCode, user: BANK1_MAKER1 });
  });
});
