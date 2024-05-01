const {
  ROLES: { MAKER, CHECKER },
} = require('@ukef/dtfs2-common');
const { NON_MAKER_ROLES } = require('../../../../test-helpers/common-role-lists');
const componentRenderer = require('../../../componentRenderer');

const component = 'contract/components/contract-actions/proceed-to-review-button.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe('when viewed by a maker', () => {
    const user = { roles: [MAKER] };

    it("should be enabled for deals in stage Draft and stage Further Maker's input required and when isEveryDealFormComplete flag is true", () => {
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
      ];

      const isEveryDealFormComplete = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, isEveryDealFormComplete });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should be enabled for deals in stage Acknowledged with dealHasIssuedFacilitiesToSubmit flag set to true', () => {
      const deals = [{ _id: 1, status: 'Acknowledged' }];

      const isEveryDealFormComplete = true;
      const dealHasIssuedFacilitiesToSubmit = true;

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          isEveryDealFormComplete,
          dealHasIssuedFacilitiesToSubmit,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it("should be enabled for deals in stage `Acknowledged` and `Further Maker's input required` when both dealHasIssuedFacilitiesToSubmit and isEveryDealFormComplete flags are true", () => {
      const deals = [
        { _id: 1, status: 'Acknowledged' },
        { _id: 3, status: "Further Maker's input required" },
      ];

      const dealHasIssuedFacilitiesToSubmit = true;
      const isEveryDealFormComplete = true;

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          isEveryDealFormComplete,
          dealHasIssuedFacilitiesToSubmit,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should not be enabled for deals in stage `Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)`, until facility start dates confirmed', () => {
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          isEveryDealFormComplete: true,
          allRequestedCoverStartDatesConfirmed: false,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toBeDisabled();
      }
    });

    it('should be enabled for deals in stage `Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)` and all facility start dates confirmed', () => {
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          isEveryDealFormComplete: true,
          allRequestedCoverStartDatesConfirmed: true,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should not be enabled for deals in stage `Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)` and no dealHasIssuedFacilitiesToSubmit', () => {
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          isEveryDealFormComplete: true,
          allRequestedCoverStartDatesConfirmed: false,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toBeDisabled();
      }
    });

    it('should be enabled for deals in stage `Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)` and dealHasIssuedFacilitiesToSubmit', () => {
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          isEveryDealFormComplete: true,
          dealHasIssuedFacilitiesToSubmit: true,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should not render at all for deals in stage Submitted and stage Rejected by UKEF', () => {
      const deals = [
        { _id: 1, status: 'Submitted' },
        { _id: 2, status: 'Rejected by UKEF' },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').notToExist();
      }
    });

    it('should not be visible when the deal forms are not completed', () => {
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
        { _id: 3, status: 'Abandoned' },
        { _id: 4, status: 'Acknowledged' },
      ];

      const isEveryDealFormComplete = false;
      const dealHasIssuedFacilitiesToSubmit = false;

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          isEveryDealFormComplete,
          dealHasIssuedFacilitiesToSubmit,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').notToExist();
      }
    });

    it('should be enabled when the deal is in the below stage and all forms have been completed', () => {
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
      ];

      const isEveryDealFormComplete = true;
      const dealHasIssuedFacilitiesToSubmit = false;

      for (const deal of deals) {
        const wrapper = render({
          user,
          deal,
          isEveryDealFormComplete,
          dealHasIssuedFacilitiesToSubmit,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should be disabled for deals where isEveryDealFormComplete and dealHasIssuedFacilitiesToSubmit is false', () => {
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
        { _id: 3, status: 'Abandoned' },
        { _id: 4, status: 'Acknowledged' },
      ];

      const isEveryDealFormComplete = false;
      const dealHasIssuedFacilitiesToSubmit = false;

      for (const deal of deals) {
        const wrapper = render({ user, deal, isEveryDealFormComplete, dealHasIssuedFacilitiesToSubmit });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').notToExist();
      }
    });

    it("should be disabled when the user is maker when the deal stage is in `Ready for Checker's approval`", () => {
      const deals = [{ _id: 1, status: "Ready for Checker's approval" }];

      const isEveryDealFormComplete = true;
      const dealHasIssuedFacilitiesToSubmit = false;

      for (const deal of deals) {
        const wrapper = render({ user, deal, isEveryDealFormComplete, dealHasIssuedFacilitiesToSubmit });
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
    it("should not render at all for deals in stage Ready for Checker's approval with isEveryDealFormComplete flag set to true", () => {
      const user = { roles: [MAKER, CHECKER] };
      const deal = { _id: 4, status: "Ready for Checker's approval" };
      const isEveryDealFormComplete = true;

      const wrapper = render({ user, deal, isEveryDealFormComplete });
      wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').notToExist();
    });
  });
});
