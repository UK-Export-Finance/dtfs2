const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/clone-deal-link.njk';
const render = componentRenderer(component);
const { ROLES: { MAKER } } = require('../../../server/constants');
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');
const { DRAFT, CHANGES_REQUIRED, SUBMITTED_TO_UKEF, UKEF_REFUSED, ABANDONED, UKEF_ACKNOWLEDGED, UKEF_APPROVED_WITHOUT_CONDITIONS, UKEF_APPROVED_WITH_CONDITIONS, READY_FOR_APPROVAL } = require('../../../server/constants/status');

describe(component, () => {
  const deals = [
    { _id: '61f6fbaea2460c018a4189d1', status: DRAFT },
    { _id: '61f6fbaea2460c018a4189d2', status: CHANGES_REQUIRED },
    { _id: '61f6fbaea2460c018a4189d3', status: SUBMITTED_TO_UKEF },
    { _id: '61f6fbaea2460c018a4189d4', status: UKEF_REFUSED },
    { _id: '61f6fbaea2460c018a4189d5', status: ABANDONED },
    { _id: '61f6fbaea2460c018a4189d6', status: UKEF_ACKNOWLEDGED },
    { _id: '61f6fbaea2460c018a4189d7', status: UKEF_APPROVED_WITHOUT_CONDITIONS },
    { _id: '61f6fbaea2460c018a4189d8', status: UKEF_APPROVED_WITH_CONDITIONS },
    { _id: '61f6fbaea2460c018a4189d9', status: READY_FOR_APPROVAL },
  ];

  describe('when viewed with the role maker', () => {
    const roles = [MAKER];
    const mockUser = { roles };

    it('should be enabled', () => {
      for (const deal of deals) {
        const wrapper = render({ user: mockUser, deal });
        wrapper.expectLink('[data-cy="clone-deal-link"]').toLinkTo(`/contract/${deal._id}/clone/before-you-start`, 'Clone');
      }
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed with the role %s', (nonMakerRole) => {
    it('should not render at all', () => {
      const mockUser = { roles: [nonMakerRole] };

      for (const deal of deals) {
        const wrapper = render({ user: mockUser, deal });
        wrapper.expectLink('[data-cy="clone-deal-link"]').notToExist();
      }
    });
  });
});
