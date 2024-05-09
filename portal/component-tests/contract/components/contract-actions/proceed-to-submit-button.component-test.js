const {
  ROLES: { CHECKER, MAKER },
} = require('@ukef/dtfs2-common');
const { NON_CHECKER_ROLES } = require('../../../../test-helpers/common-role-lists');

const componentRenderer = require('../../../componentRenderer');

const component = 'contract/components/contract-actions/proceed-to-submit-button.njk';
const render = componentRenderer(component);

describe(component, () => {
  const checkerRoleTests = () => {
    const user = { roles: [CHECKER] };

    describe('when userCanSubmit param set to false', () => {
      it('should not render at all', () => {
        const deals = [
          { _id: 1, status: "Ready for Checker's approval" },
          { _id: 2, status: 'Submitted' },
          { _id: 3, status: 'Rejected by UKEF' },
          { _id: 4, status: 'Draft' },
          { _id: 5, status: "Further Maker's input required" },
          { _id: 6, status: 'Abandoned' },
          { _id: 7, status: 'Acknowledged' },
          { _id: 8, status: 'Accepted by UKEF (without conditions)' },
          { _id: 9, status: 'Accepted by UKEF (with conditions)' },
        ];
        const userCanSubmit = false;

        for (const deal of deals) {
          const wrapper = render({ user, deal, userCanSubmit });
          wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]').notToExist();
        }
      });
    });

    describe('when userCanSubmit param is true', () => {
      it("should be enabled for deals in status=Ready for Checker's approval", () => {
        const deals = [{ _id: 1, status: "Ready for Checker's approval" }];
        const userCanSubmit = true;

        for (const deal of deals) {
          const wrapper = render({ user, deal, userCanSubmit });
          wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]').toLinkTo(`/contract/${deal._id}/confirm-submission`, 'Proceed to submit');
        }
      });

      it('should not render at all for deals in status=Submitted and status=Rejected by UKEF', () => {
        const deals = [
          { _id: 1, status: 'Submitted' },
          { _id: 2, status: 'Rejected by UKEF' },
        ];
        const userCanSubmit = true;

        for (const deal of deals) {
          const wrapper = render({ user, deal, userCanSubmit });
          wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]').notToExist();
        }
      });

      it('should be disabled for deals in all other states', () => {
        const deals = [
          { _id: 1, status: 'Draft' },
          { _id: 2, status: 'Abandoned' },
          { _id: 3, status: 'Acknowledged' },
          { _id: 4, status: 'Accepted by UKEF (without conditions)' },
          { _id: 5, status: 'Accepted by UKEF (with conditions)' },
          { _id: 6, status: 'In progress by UKEF' },
        ];
        const userCanSubmit = true;

        for (const deal of deals) {
          const wrapper = render({ user, deal, userCanSubmit });
          wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]').toBeDisabled();
        }
      });
    });
  };

  function nonCheckerRoleTests(nonCheckerRole) {
    it('should not render at all', () => {
      const user = { roles: nonCheckerRole };
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: 'Rejected by UKEF' },
        { _id: 3, status: 'Abandoned' },
        { _id: 4, status: 'Acknowledged' },
        { _id: 5, status: 'Accepted by UKEF (without conditions)' },
        { _id: 6, status: 'Accepted by UKEF (with conditions)' },
        { _id: 7, status: "Ready for Checker's approval" },
        { _id: 8, status: 'Rejected by UKEF' },
        { _id: 9, status: 'Submitted' },
        { _id: 10, status: 'In progress by UKEF' },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]').notToExist();
      }
    });
  }

  describe('when viewed by a checker', () => {
    checkerRoleTests();
  });

  describe.each(NON_CHECKER_ROLES)('when viewed with the role %s', (nonCheckerRole) => {
    nonCheckerRoleTests(nonCheckerRole);
  });

  // TODO DTFS2-6508: Remove maker checker role
  describe('when viewed by a user with checker AND maker roles, with userCanSubmit param set to true', () => {
    it('should be enabled', () => {
      const user = { roles: [MAKER, CHECKER] };
      const deals = [
        { _id: 1, status: 'Submitted' },
        { _id: 2, status: 'Rejected by UKEF' },
      ];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]').toLinkTo(`/contract/${deal._id}/confirm-submission`, 'Proceed to submit');
      }
    });

    it('should NOT render when deal status is `Draft`', () => {
      const user = { roles: [MAKER, CHECKER] };
      const deals = [{ _id: 1, status: 'Draft' }];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ProceedToSubmit"]').notToExist();
      }
    });

    it("should NOT render when deal status is `Further Maker's input required`", () => {
      const user = { roles: [MAKER, CHECKER] };
      const deals = [{ _id: 1, status: "Further Maker's input required" }];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ProceedToSubmit"]').notToExist();
      }
    });

    it('should NOT render when deal status is `Acknowledged`', () => {
      const user = { roles: [MAKER, CHECKER] };
      const deals = [{ _id: 1, status: "Further Maker's input required" }];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ProceedToSubmit"]').notToExist();
      }
    });

    it('should NOT render when deal status is `In progress by UKEF`', () => {
      const user = { roles: [MAKER, CHECKER] };
      const deals = [{ _id: 1, status: 'In progress by UKEF' }];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ProceedToSubmit"]').notToExist();
      }
    });

    it('should NOT render when deal status is `Accepted by UKEF (without conditions)`', () => {
      const user = { roles: [MAKER, CHECKER] };
      const deals = [{ _id: 1, status: 'Accepted by UKEF (without conditions)' }];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ProceedToSubmit"]').notToExist();
      }
    });

    it('should NOT render when deal status is `Accepted by UKEF (with conditions)`', () => {
      const user = { roles: [MAKER, CHECKER] };
      const deals = [{ _id: 1, status: 'Accepted by UKEF (with conditions)' }];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ProceedToSubmit"]').notToExist();
      }
    });
  });
});
