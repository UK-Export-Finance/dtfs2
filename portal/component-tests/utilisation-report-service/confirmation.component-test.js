const pageRenderer = require('../pageRenderer');

const page = 'utilisation-report-service/utilisation-report-upload/confirmation.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const reportMonthYear = 'June 2023';
  const bankEmail = 'tradefinance@barclays.com';

  beforeEach(() => {
    wrapper = render({ reportMonthYear, bankEmail });
  });

  it('should render page heading', () => {
    wrapper.expectText('[data-cy="confirmation-main-heading"]').toRead(`${reportMonthYear} GEF report sent to UKEF`);
  });

  it('should render paragraph', () => {
    wrapper.expectText('[data-cy="paragraph"]').toRead(`A confirmation email has been sent to ${bankEmail}.`);
  });

  it('should render Signout button', () => {
    wrapper.expectElement('[data-cy="logout-button"]').toExist();
    wrapper.expectText('[data-cy="logout-button"]').toRead('Sign out');
  });
});
