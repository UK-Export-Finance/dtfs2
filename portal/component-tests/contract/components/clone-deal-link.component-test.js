const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/clone-deal-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  const makerRole = ['maker'];
  const nonMakerRoles = ['checker', 'admin', 'read-only'];
  const deals = [
    { _id: '61f6fbaea2460c018a4189d1', status: 'Draft' },
    { _id: '61f6fbaea2460c018a4189d2', status: "Further Maker's input required" },
    { _id: '61f6fbaea2460c018a4189d3', status: 'Submitted' },
    { _id: '61f6fbaea2460c018a4189d4', status: 'Rejected by UKEF' },
    { _id: '61f6fbaea2460c018a4189d5', status: 'Abandoned' },
    { _id: '61f6fbaea2460c018a4189d6', status: 'Acknowledged' },
    { _id: '61f6fbaea2460c018a4189d7', status: 'Accepted by UKEF (without conditions)' },
    { _id: '61f6fbaea2460c018a4189d8', status: 'Accepted by UKEF (with conditions)' },
    { _id: '61f6fbaea2460c018a4189d9', status: "Ready for Checker's approval" },
  ];

  function makerRoleTests(roleToCombineWithMaker) {
    let roles = [...makerRole];
    if (roleToCombineWithMaker) {
      roles = [...roles, roleToCombineWithMaker];
    }
    const mockUser = { roles };

    it('should be enabled', () => {
      for (const deal of deals) {
        const wrapper = render({ user: mockUser, deal });
        wrapper.expectLink('[data-cy="clone-deal-link"]').toLinkTo(`/contract/${deal._id}/clone/before-you-start`, 'Clone');
      }
    });
  }

  function nonMakerRoleTests(nonMakerRole) {
    it('should not render at all', () => {
      const mockUser = { roles: [nonMakerRole] };

      for (const deal of deals) {
        const wrapper = render({ user: mockUser, deal });
        wrapper.expectLink('[data-cy="clone-deal-link"]').notToExist();
      }
    });
  }

  describe('when viewed with the role maker', () => {
    makerRoleTests();
  });

  describe.each(nonMakerRoles)('when viewed with roles maker and %s', (nonMakerRole) => {
    makerRoleTests(nonMakerRole);
  });

  describe.each(nonMakerRoles)('when viewed with the role %s', (nonMakerRole) => {
    nonMakerRoleTests(nonMakerRole);
  });
});
