const pageRenderer = require('../pageRenderer');

const page = 'utilisation-report-service/utilisation-report-upload/confirmation.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const reportPeriod = 'June 2023';
  const paymentOfficerEmails = ['tradefinance1@testbank1.com', 'tradefinance2@testbank1.com'];

  beforeEach(() => {
    wrapper = render({ reportPeriod, paymentOfficerEmails });
  });

  it('should render page heading', () => {
    wrapper.expectText('[data-cy="main-heading"]').toRead(`${reportPeriod} GEF report sent to UKEF`);
  });

  it('should render email confirmation list', () => {
    wrapper.expectText('[data-cy="email-text"]').toRead('A confirmation email has been sent to:');
    for (const paymentOfficerEmail of paymentOfficerEmails) {
      wrapper.expectElement(`ul.govuk-list > li:contains("${paymentOfficerEmail}")`).toExist();
    }
  });

  it('should render Signout button', () => {
    wrapper.expectElement('[data-cy="logout-button"]').toExist();
    wrapper.expectText('[data-cy="logout-button"]').toRead('Sign out');
  });
});
