const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/clone-deal-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe('when viewed a maker', () => {
    it('should be enabled', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { status: 'Draft' },
        { status: "Further Maker's input required" },
        { status: 'Submitted' },
        { status: 'Rejected by UKEF' },
        { status: 'Abandoned' },
        { status: 'Acknowledged by UKEF' },
        { status: 'Accepted by UKEF (without conditions)' },
        { status: 'Accepted by UKEF (with conditions)' },
        { status: "Ready for Checker's approval" },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectLink('[data-cy="clone-deal-link"]')
          .toLinkTo(`/contract/${deal._id}/clone/before-you-start`, 'Clone');
      }
    });
  });

  describe('when viewed by a checker', () => {
    it('should not render at all', () => {
      const user = { roles: ['checker'] };
      const deals = [
        { status: 'Draft' },
        { status: "Further Maker's input required" },
        { status: 'Submitted' },
        { status: 'Rejected by UKEF' },
        { status: 'Abandoned' },
        { status: 'Acknowledged by UKEF' },
        { status: 'Accepted by UKEF (without conditions)' },
        { status: 'Accepted by UKEF (with conditions)' },
        { status: "Ready for Checker's approval" },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectLink('[data-cy="clone-deal-link"]')
          .notToExist();
      }
    });
  });
});
