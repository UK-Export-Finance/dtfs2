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

    it('renders a contact link', () => {
      wrapper.expectLink('[data-cy="footer-contact-link"]').toLinkTo('/contact', 'Contact');
    });

    it('renders a feedback link', () => {
      wrapper.expectLink('[data-cy="footer-feedback-link"]').toLinkTo('/feedback', 'Feedback');
    });

    it('renders a cookies link', () => {
      wrapper.expectLink('[data-cy="footer-cookies-link"]').toLinkTo('/cookies', 'Cookies');
    });

    it('renders a accessibility statement link', () => {
      wrapper.expectLink('[data-cy="footer-accessibility-statement-link"]').toLinkTo('/accessibility-statement', 'Accessibility statement');
    });

    it('renders a report a vulnerability link', () => {
      wrapper
        .expectLink('[data-cy="footer-report-vulnerability-link"]')
        .toLinkTo('https://www.gov.uk/guidance/report-a-vulnerability-on-a-ukef-system', 'Report a vulnerability');
    });
  });
});
