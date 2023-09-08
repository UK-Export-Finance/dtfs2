const { ADMIN, MAKER, CHECKER } = require('../../server/constants/roles');
const { NON_MAKER_OR_CHECKER_OR_ADMIN_ROLES } = require('../helpers/common-role-lists');
const pageRenderer = require('../pageRenderer');

const page = '_partials/primary-navigation.njk';
const render = pageRenderer(page);

const rolesToDisplayAllNavigationItems = [ADMIN];
const rolesToDisplayHomeAndReportsNavigationItems = [MAKER, CHECKER];
const rolesToDisplayHomeNavigationItem = NON_MAKER_OR_CHECKER_OR_ADMIN_ROLES;

describe(page, () => {
  let wrapper;

  describe.each(rolesToDisplayAllNavigationItems)('viewed by a %s', (role) => {
    const user = { roles: [role] };

    beforeAll(() => {
      wrapper = render({ user });
    });

    itRendersAHomeLink();
    itRendersAReportsLink();
    itRendersAUsersLink();
  });

  describe.each(rolesToDisplayHomeAndReportsNavigationItems)('viewed by a %s', (role) => {
    const user = { roles: [role] };

    beforeAll(() => {
      wrapper = render({ user });
    });

    itRendersAHomeLink();
    itRendersAReportsLink();
    itDoesNotRenderAUsersLink();
  });

  describe.each(rolesToDisplayHomeNavigationItem)('viewed by a %s', (role) => {
    const user = { roles: [role] };

    beforeAll(() => {
      wrapper = render({ user });
    });

    itRendersAHomeLink();
    itDoesNotRenderAReportsLink();
    itDoesNotRenderAUsersLink();
  });

  function itRendersAHomeLink() {
    it('renders a home link', () => {
      wrapper.expectLink('[data-cy="dashboard"]').toLinkTo('/dashboard', 'Home');
    });
  }

  function itRendersAReportsLink() {
    it('renders a reports link', () => {
      wrapper.expectLink('[data-cy="reports"]').toLinkTo('/reports', 'Reports');
    });
  }

  function itDoesNotRenderAReportsLink() {
    it('does not render a reports link', () => {
      wrapper.expectLink('[data-cy="reports"]').notToExist();
    });
  }

  function itRendersAUsersLink() {
    it('renders a users link', () => {
      wrapper.expectLink('[data-cy="users"]').toLinkTo('/admin/users', 'Users');
    });
  }

  function itDoesNotRenderAUsersLink() {
    it('does not render a users link', () => {
      wrapper.expectLink('[data-cy="users"]').notToExist();
    });
  }
});
