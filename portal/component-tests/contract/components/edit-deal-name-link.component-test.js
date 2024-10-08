const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');

const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/edit-deal-name-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe('when viewed by the maker who created the deal', () => {
    const user = { _id: 123, roles: [MAKER] };

    it("should be enabled for deals in status=Draft and status=Further Maker's input required", () => {
      const deals = [
        {
          _id: '61f6fbaea2460c018a4189d7',
          status: 'Draft',
          maker: { _id: 123 },
        },
        {
          _id: '61f6fbaea2460c018a4189d8',
          status: "Further Maker's input required",
          maker: { _id: 123 },
        },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectLink('[data-cy="EditDealName"]').toLinkTo(`/contract/${deal._id}/edit-name`, 'Edit deal name');
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
          _id: 4,
          status: 'Acknowledged',
          maker: { _id: 123 },
        },
        {
          _id: 5,
          status: 'Accepted by UKEF (without conditions)',
          maker: { _id: 123 },
        },
        {
          _id: 6,
          status: 'Accepted by UKEF (with conditions)',
          maker: { _id: 123 },
        },
        {
          _id: 7,
          status: "Ready for Checker's approval",
          maker: { _id: 123 },
        },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectLink('[data-cy="EditDealName"]').notToExist();
      }
    });
  });

  describe('when viewed by a maker who did not create the deal', () => {
    const user = { _id: 987, roles: [MAKER] };

    it('should not render at all', () => {
      const deals = [
        {
          status: 'Draft',
          maker: { _id: 123 },
        },
        {
          status: "Further Maker's input required",
          maker: { _id: 123 },
        },
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
        const wrapper = render({ user, deal });
        wrapper.expectLink('[data-cy="EditDealName"]').notToExist();
      }
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed by a %s', (nonMakerRole) => {
    it('should not render at all', () => {
      const user = { roles: [nonMakerRole] };
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
        const wrapper = render({ user, deal });
        wrapper.expectLink('[data-cy="EditDealName"]').notToExist();
      }
    });
  });
});
