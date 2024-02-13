const { ROLES: { MAKER, CHECKER } } = require('../../../../server/constants');
const { NON_MAKER_ROLES } = require('../../../../test-helpers/common-role-lists');
const componentRenderer = require('../../../componentRenderer');

const component = 'contract/components/contract-actions/proceed-to-review-button.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe('when viewed by a maker', () => {
    const user = { roles: [MAKER] };

    it("should be enabled for deals in status=Draft and status=Further Maker's input required and when dealFormsCompleted flag is true", () => {
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
      ];

      const dealFormsCompleted = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, dealFormsCompleted });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should be enabled for deals in status=Acknowledged with dealHasIssuedFacilitiesToSubmit flag set to true', () => {
      const deals = [{ _id: 1, status: 'Acknowledged' }];

      const dealFormsCompleted = true;
      const dealHasIssuedFacilitiesToSubmit = true;

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          dealFormsCompleted,
          dealHasIssuedFacilitiesToSubmit,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it("should be enabled for deals in status=`Acknowledged`, `Ready for Checker's approval`, `Further Maker's input required` when dealHasIssuedFacilitiesToSubmit flag set to true and dealFormsCompleted flag set to false", () => {
      const deals = [
        { _id: 1, status: 'Acknowledged' },
        { _id: 4, status: "Ready for Checker's approval" },
      ];

      const dealHasIssuedFacilitiesToSubmit = true;

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          dealHasIssuedFacilitiesToSubmit,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should not be enabled for deals in status=`Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)`, until facility start dates confirmed', () => {
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          dealFormsCompleted: true,
          allRequestedCoverStartDatesConfirmed: false,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toBeDisabled();
      }
    });

    it('should be enabled for deals in status=`Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)` and all facility start dates confirmed', () => {
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          dealFormsCompleted: true,
          allRequestedCoverStartDatesConfirmed: true,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should not be enabled for deals in status=`Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)` and no dealHasIssuedFacilitiesToSubmit', () => {
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          dealFormsCompleted: true,
          allRequestedCoverStartDatesConfirmed: false,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toBeDisabled();
      }
    });

    it('should be enabled for deals in status=`Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)` and dealHasIssuedFacilitiesToSubmit', () => {
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          dealFormsCompleted: true,
          dealHasIssuedFacilitiesToSubmit: true,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should not render at all for deals in status=Submitted and status=Rejected by UKEF', () => {
      const deals = [
        { _id: 1, status: 'Submitted' },
        { _id: 2, status: 'Rejected by UKEF' },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').notToExist();
      }
    });

    it('should be disabled when dealFormsCompleted and dealHasIssuedFacilitiesToSubmit flags are false', () => {
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
        { _id: 3, status: 'Abandoned' },
        { _id: 4, status: 'Acknowledged' },
      ];

      const dealFormsCompleted = false;
      const dealHasIssuedFacilitiesToSubmit = false;

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          dealFormsCompleted,
          dealHasIssuedFacilitiesToSubmit,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toBeDisabled();
      }
    });

    it('should be disabled for deals in all other states', () => {
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
        { _id: 3, status: 'Abandoned' },
        { _id: 4, status: 'Acknowledged' },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toBeDisabled();
      }
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed with roles %s', (nonMakerRole) => {
    const user = { roles: nonMakerRole };

    it('should not render at all', () => {
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
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').notToExist();
      }
    });
  });

  // TODO DTFS2-6508: Remove maker checker role
  describe('when viewed by a maker checker', () => {
    it("should not render at all for deals in status=Ready for Checker's approval with dealFormsCompleted flag set to true", () => {
      const user = { roles: [MAKER, CHECKER] };
      const deal = { _id: 4, status: "Ready for Checker's approval" };
      const dealFormsCompleted = true;

      const wrapper = render({ user, deal, dealFormsCompleted });
      wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').notToExist();
    });
  });
});
