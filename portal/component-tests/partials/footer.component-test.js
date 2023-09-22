const { ALL_ROLES } = require('../../test-helpers/common-role-lists');
const pageRenderer = require('../pageRenderer');

const page = '_partials/footer.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const usersWithRoles = ALL_ROLES.map((role) => ({ testDescription: role, user: { roles: [] } }));

  const testCases = [...usersWithRoles, { testDescription: 'user with no roles', user: {} }, { testDescription: 'logged out user', user: { roles: [] } }];

  describe.each(testCases)('viewed by a $testDescription', (role) => {
    const user = {
      roles: [role],
    };

    beforeAll(() => {
      wrapper = render({ user });
    });

    it('renders a feedback link', () => {
      wrapper.expectLink('[data-cy="feedback-link"]').toLinkTo('/feedback', 'Feedback');
    });
  });
});
