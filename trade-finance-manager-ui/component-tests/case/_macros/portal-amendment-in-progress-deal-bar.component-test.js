const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/case/amendments/_macros/portal-amendment-in-progress-deal-bar.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  describe('when a portal amendment does not exist', () => {
    it('should not render the banner', () => {
      const params = {
        hasInProgressPortalAmendments: false,
      };

      wrapper = render(params);

      wrapper.expectText('[data-cy="portal-amendment--in-progress-deal-bar"]').notToExist();
    });
  });

  describe('when one portal amendment exists', () => {
    it('should render the banner with the correct text', () => {
      const params = {
        hasInProgressPortalAmendments: [{ ukefFacilityId: '12345' }],
      };

      wrapper = render(params);

      wrapper
        .expectText('[data-cy="portal-amendment--in-progress-deal-bar"]')
        .toRead(`There is an amendment initiated by the bank on the deal (Facility ${params.hasInProgressPortalAmendments[0].ukefFacilityId}).`);
    });
  });

  describe('when more than one portal amendment exists', () => {
    it('should render the banner with the correct text', () => {
      const params = {
        hasInProgressPortalAmendments: [{ ukefFacilityId: '12345' }, { ukefFacilityId: '67890' }],
      };

      wrapper = render(params);

      wrapper
        .expectText('[data-cy="portal-amendment--in-progress-deal-bar"]')
        .toRead(
          `There is an amendment initiated by the bank on the deal (Facility ${params.hasInProgressPortalAmendments[0].ukefFacilityId}, ${params.hasInProgressPortalAmendments[1].ukefFacilityId}).`,
        );
    });
  });
});
