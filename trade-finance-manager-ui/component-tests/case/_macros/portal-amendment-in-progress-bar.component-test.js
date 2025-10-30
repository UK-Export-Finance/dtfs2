const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/case/amendments/_macros/portal-amendment-in-progress-bar.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  describe('when a portal amendment exists', () => {
    it('should render the banner', () => {
      const params = {
        inProgressPortalAmendments: [{ ukefFacilityId: '12345' }],
      };

      wrapper = render(params);

      wrapper.expectText('[data-cy="portal-amendment--in-progress-bar"]').toRead('There is an amendment in progress for this facility');
    });
  });

  describe('when a portal amendment does not exist', () => {
    it('should not render the banner', () => {
      const params = {
        hasInProgressPortalAmendments: false,
      };

      wrapper = render(params);

      wrapper.expectText('[data-cy="portal-amendment--in-progress-bar"]').notToExist();
    });
  });
});
