const pageRenderer = require('../pageRenderer');

const page = 'service-options/service-options.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  describe('service options page', () => {
    it('should display portal link if canAccessPortal is true', () => {
      wrapper = render({ canAccessPortal: true });
      wrapper.expectElement('[data-cy="portal-link"]').toExist();
      wrapper.expectElement('[data-cy="utilisation-report-link"]').notToExist();
    });

    it('should display utilisation report link if canAccessUtilisationReports is true', () => {
      wrapper = render({ canAccessUtilisationReports: true });
      wrapper.expectElement('[data-cy="utilisation-report-link"]').toExist();
      wrapper.expectElement('[data-cy="portal-link"]').notToExist();
    });
  });
});
