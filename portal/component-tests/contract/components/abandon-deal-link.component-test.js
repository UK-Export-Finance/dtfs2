const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/abandon-deal-link.njk';
const render = componentRenderer(component);
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');

describe(component, () => {
  describe('when viewed by a maker', () => {
    const roles = [MAKER];

    const mockUser = { _id: 123, roles };

    it("should be enabled for deals in status=Draft and status=Further Maker's input required", () => {
      const deals = [
        {
          _id: '61f6fbaea2460c018a4189d7',
          status: 'Draft',
          maker: { _id: 123 },
        },
        {
          _id: '61f6fbaea2460c018a4189d7',
          status: "Further Maker's input required",
          maker: { _id: 123 },
        },
      ];

      for (const deal of deals) {
        const wrapper = render({ user: mockUser, deal });
        wrapper.expectLink('[data-cy="AbandonLink"]').toLinkTo(`/contract/${deal._id}/delete`, 'Abandon');
      }
    });

    it('should not render at all for deals in any other status', () => {
      const deals = [
        {
          status: 'Submitted',
          maker: { _id: 123 },
        },
        {
          status: 'Rejected by UKEF',
          maker: { _id: 123 },
        },
        {
          status: 'Abandoned',
          maker: { _id: 123 },
        },
        {
          status: 'Acknowledged',
          maker: { _id: 123 },
        },
        {
          status: 'Accepted by UKEF (without conditions)',
          maker: { _id: 123 },
        },
        {
          status: 'Accepted by UKEF (with conditions)',
          maker: { _id: 123 },
        },
        {
          status: "Ready for Checker's approval",
          maker: { _id: 123 },
        },
      ];

      for (const deal of deals) {
        const wrapper = render({ user: mockUser, deal });
        wrapper.expectLink('[data-cy="AbandonLink"]').notToExist();
      }
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed with the role %s', (nonMakerRole) => {
    it('should not render at all', () => {
      const mockUser = { roles: [nonMakerRole] };
      const deals = [
        { status: 'Draft' },
        { status: "Further Maker's input required" },
        { status: 'Submitted' },
        { status: 'Rejected by UKEF' },
        { status: 'Abandoned' },
        { status: 'Acknowledged' },
        { status: 'Accepted by UKEF (without conditions)' },
        { status: 'Accepted by UKEF (with conditions)' },
        { status: "Ready for Checker's approval" },
      ];

      for (const deal of deals) {
        const wrapper = render({ user: mockUser, deal });
        wrapper.expectLink('[data-cy="AbandonLink"]').notToExist();
      }
    });
  });
});
