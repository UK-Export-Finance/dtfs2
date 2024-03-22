const pageRenderer = require('../pageRenderer');

const page = 'utilisation-report-service/utilisation-report-upload/confirmation.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const reportPeriod = 'June 2023';
  const paymentOfficerEmail = 'tradefinance@barclays.com';

  beforeEach(() => {
    wrapper = render({ reportPeriod, paymentOfficerEmail });
  });

  it('should render page heading', () => {
    wrapper.expectText('[data-cy="confirmation-main-heading"]').toRead(`${reportPeriod} GEF report sent to UKEF`);
  });

  it('should render paragraph', () => {
    wrapper.expectText('[data-cy="paragraph"]').toRead(`A confirmation email has been sent to:`);
  });

  it('should render Signout button', () => {
    wrapper.expectElement('[data-cy="logout-button"]').toExist();
    wrapper.expectText('[data-cy="logout-button"]').toRead('Sign out');
  });
});
