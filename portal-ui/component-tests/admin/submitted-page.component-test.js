const { ROLES } = require('@ukef/dtfs2-common');
const pageRenderer = require('../pageRenderer');

const page = 'admin/submitted-page.njk';

const render = pageRenderer(page);

let wrapper;

const _id = '12345';
const user = { roles: [ROLES.MAKER], _id, username: 'test@ukexportfinance.gov.uk' };

const dashboardPageUrl = '/dashboard/deals';

const params = {
  _id,
  user,
};

describe(page, () => {
  it('should render the confirmation panel', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="submitted-reset-password-request-panel"]').toRead('Password reset request sent');
  });

  it('should render the text section', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="reset-link-sent-text"]').toRead(`${user.username} will receive an email instructions to reset their password shortly.`);
  });

  it('should render the `Back to dashboard` button', () => {
    wrapper = render(params);

    wrapper.expectSecondaryButton('[data-cy="back-to-dashboard-button"]').toLinkTo(dashboardPageUrl, 'Back to dashboard');
  });
});
