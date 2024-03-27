const pageRenderer = require('../pageRenderer');

const page = 'utilisation-report-service/utilisation-report-upload/confirmation.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const reportPeriod = 'June 2023';
  const paymentOfficerEmails = ['tradefinance1@barclays.com', 'tradefinance2@barclays.com'];

  beforeEach(() => {
    wrapper = render({ reportPeriod, paymentOfficerEmails });
  });

  it('should render page heading', () => {
    wrapper.expectText('[data-cy="confirmation-main-heading"]').toRead(`${reportPeriod} GEF report sent to UKEF`);
  });

  it('should render paragraph', () => {
    wrapper.expectText('[data-cy="paragraph"]').toRead('A confirmation email has been sent to:');
    wrapper.expectElement('[data-cy="list-item-link-tradefinance1@barclays.com"]').toExist();
    wrapper.expectText('[data-cy="list-item-link-tradefinance1@barclays.com"]').toRead('tradefinance1@barclays.com');
    wrapper.expectElement('[data-cy="list-item-link-tradefinance2@barclays.com"]').toExist();
    wrapper.expectText('[data-cy="list-item-link-tradefinance2@barclays.com"]').toRead('tradefinance2@barclays.com');
  });

  it('should render Signout button', () => {
    wrapper.expectElement('[data-cy="logout-button"]').toExist();
    wrapper.expectText('[data-cy="logout-button"]').toRead('Sign out');
  });
});
