const pageRenderer = require('../pageRenderer');

const page = 'login/we-have-sent-you-another-link.njk';
const render = pageRenderer(page);

describe(page, () => {
  const signInLinkTargetEmailAddress = 'user@example.com';
  const regexForTextContainingTargetEmailAddress = /user@example\.com/;
  let wrapper;

  beforeEach(() => {
    wrapper = render({ signInLinkTargetEmailAddress });
  });

  it('should render email link to contact DTFS team', () => {
    wrapper.expectText('[data-cy="dtfs-email-link"]').toRead('DigitalService.TradeFinance@ukexportfinance.gov.uk');
  });

  it('should render the email address the sign in link has been sent to', () => {
    wrapper.expectText('[data-cy="sign-in-link-target-email-address"]').toMatch(regexForTextContainingTargetEmailAddress);
  });
});
