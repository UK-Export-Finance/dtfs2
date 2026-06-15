const { BANK1_MAKER1 } = require('@ukef/dtfs2-common/test-helpers');
const checkYourEmailAccessCode = require('../../e2e/pages/login/check-your-email-access-code');
const newAccessCode = require('../../e2e/pages/login/new-access-code');

/**
 * Logs in the default 2FA user and clicks the request-code link the requested number of times.
 *
 * @param requestCodeClicks - Number of UI transitions to perform after login.
 */
module.exports = (requestCodeClicks) => {
  cy.enterUsernameAndPassword(BANK1_MAKER1);

  for (let i = 0; i < requestCodeClicks; i += 1) {
    if (i === 0) {
      checkYourEmailAccessCode.requestCodeLink().click();
    } else if (i === 1) {
      newAccessCode.requestCodeLink().click();
    }
  }
};
