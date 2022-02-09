const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/clone-deal-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe('when viewed a maker', () => {
    it('should be enabled', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: '61f6fbaea2460c018a4189d1', status: 'Draft' },
        { _id: '61f6fbaea2460c018a4189d2', status: "Further Maker's input required" },
        { _id: '61f6fbaea2460c018a4189d3', status: 'Submitted' },
        { _id: '61f6fbaea2460c018a4189d4', status: 'Rejected by UKEF' },
        { _id: '61f6fbaea2460c018a4189d5', status: 'Abandoned' },
        { _id: '61f6fbaea2460c018a4189d6', status: 'Acknowledged by UKEF' },
        { _id: '61f6fbaea2460c018a4189d7', status: 'Accepted by UKEF (without conditions)' },
        { _id: '61f6fbaea2460c018a4189d8', status: 'Accepted by UKEF (with conditions)' },
        { _id: '61f6fbaea2460c018a4189d9', status: "Ready for Checker's approval" },
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
        { _id: '61f6fbaea2460c018a4189d1', status: 'Draft' },
        { _id: '61f6fbaea2460c018a4189d2', status: "Further Maker's input required" },
        { _id: '61f6fbaea2460c018a4189d3', status: 'Submitted' },
        { _id: '61f6fbaea2460c018a4189d4', status: 'Rejected by UKEF' },
        { _id: '61f6fbaea2460c018a4189d5', status: 'Abandoned' },
        { _id: '61f6fbaea2460c018a4189d6', status: 'Acknowledged by UKEF' },
        { _id: '61f6fbaea2460c018a4189d7', status: 'Accepted by UKEF (without conditions)' },
        { _id: '61f6fbaea2460c018a4189d8', status: 'Accepted by UKEF (with conditions)' },
        { _id: '61f6fbaea2460c018a4189d9', status: "Ready for Checker's approval" },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectLink('[data-cy="clone-deal-link"]')
          .notToExist();
      }
    });
  });
});
