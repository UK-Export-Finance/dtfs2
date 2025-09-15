const { ROLES } = require('@ukef/dtfs2-common');
const pageRenderer = require('../pageRenderer');

const page = 'admin/user-reset-password.njk';

const render = pageRenderer(page);

let wrapper;

const _id = '12345';
const user = { roles: [ROLES.MAKER], _id, username: 'test@ukexportfinance.gov.uk' };

const editPageUrl = `/admin/users/edit/${user._id}`;

const params = {
  _id,
  user,
};

describe(page, () => {
  it('should render the page heading', () => {
    wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toRead(`Are you sure you want to reset the password for ${user.username}?`);
  });

  it('should render the `Reset password` button', () => {
    wrapper = render(params);

    wrapper.expectPrimaryButton('[data-cy="reset-password-button"]').toLinkTo(undefined, 'Reset password');
  });

  it('should render the `Cancel reset password` button', () => {
    wrapper = render(params);

    wrapper.expectLink('[data-cy="cancel-reset-password-button"]').toLinkTo(editPageUrl, 'Cancel reset password');
  });
});
