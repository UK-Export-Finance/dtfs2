const {
  ROLES: { CHECKER, MAKER },
} = require('@ukef/dtfs2-common');
const { NON_MAKER_OR_CHECKER_ROLES } = require('../../../../test-helpers/common-role-lists');
const componentRenderer = require('../../../componentRenderer');

const component = 'contract/components/contract-actions/review-eligibility-checklist-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  const checkerOrMakerRoles = [CHECKER, MAKER];

  describe.each(checkerOrMakerRoles)('when viewed with the role %s', (checkerOrMakerRole) => {
    const user = { roles: checkerOrMakerRole };

    it("should display for deals in status=Ready for Checker's approval", () => {
      const deals = [{ _id: 1, status: "Ready for Checker's approval" }];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper
          .expectLink('[data-cy="reviewEligibilityChecklistForm"]')
          .toLinkTo(`/contract/${deal._id}/submission-details#eligibility-criteria`, 'Review your eligibility checklist form');
      }
    });

    it('should not render at all for deals in any other status', () => {
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
        { _id: 3, status: 'Submitted' },
        { _id: 4, status: 'Rejected by UKEF' },
        { _id: 5, status: 'Abandoned' },
        { _id: 6, status: 'Acknowledged' },
        { _id: 7, status: 'Accepted by UKEF (without conditions)' },
        { _id: 8, status: 'Accepted by UKEF (with conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectText('[data-cy="reviewEligibilityChecklistForm"]').notToExist();
      }
    });
  });

  describe.each(NON_MAKER_OR_CHECKER_ROLES)('when viewed with the role %s', (nonCheckerOrMakerRole) => {
    const user = { roles: nonCheckerOrMakerRole };
    it('should not render at all for deals in any status', () => {
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
        { _id: 3, status: 'Submitted' },
        { _id: 4, status: 'Rejected by UKEF' },
        { _id: 5, status: 'Abandoned' },
        { _id: 6, status: 'Acknowledged' },
        { _id: 7, status: 'Accepted by UKEF (without conditions)' },
        { _id: 8, status: 'Accepted by UKEF (with conditions)' },
        { _id: 9, status: "Ready for Checker's approval" },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectText('[data-cy="reviewEligibilityChecklistForm"]').notToExist();
      }
    });
  });
});
