const componentRenderer = require('../../../componentRenderer');

const component = 'contract/components/contract-actions/proceed-to-review-button.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe('when viewed by a maker', () => {
    it("should be enabled for deals in status=Draft and status=Further Maker's input required and when dealFormsCompleted flag is true", () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
      ];

      const dealFormsCompleted = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, dealFormsCompleted });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should be enabled for deals in status=Acknowledged by UKEF with dealHasIssuedFacilitiesToSubmit flag set to true', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, status: 'Acknowledged by UKEF' },
      ];

      const dealFormsCompleted = true;
      const dealHasIssuedFacilitiesToSubmit = true;

      for (const deal of deals) {
        const wrapper = render({
          user, deal, dealFormsCompleted, dealHasIssuedFacilitiesToSubmit,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should be enabled for deals in status=`Acknowledged by UKEF`, `Ready for Checker\'s approval`, `Further Maker\'s input required` when dealHasIssuedFacilitiesToSubmit flag set to true and dealFormsCompleted flag set to false', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, status: 'Acknowledged by UKEF' },
        { _id: 4, status: 'Ready for Checker\'s approval' },
      ];

      const dealHasIssuedFacilitiesToSubmit = true;

      for (const deal of deals) {
        const wrapper = render({
          user, deal, dealHasIssuedFacilitiesToSubmit,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should not be enabled for deals in status=`Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)`, until facility start dates confirmed', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user, deal, dealFormsCompleted: true, allRequestedCoverStartDatesConfirmed: false,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toBeDisabled();
      }
    });

    it('should be enabled for deals in status=`Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)` and all facility start dates confirmed', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user, deal, dealFormsCompleted: true, allRequestedCoverStartDatesConfirmed: true,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should not be enabled for deals in status=`Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)` and no dealHasIssuedFacilitiesToSubmit', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user, deal, dealFormsCompleted: true, allRequestedCoverStartDatesConfirmed: false,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]').toBeDisabled();
      }
    });

    it('should be enabled for deals in status=`Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)` and dealHasIssuedFacilitiesToSubmit', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, status: 'Accepted by UKEF (with conditions)' },
        { _id: 2, status: 'Accepted by UKEF (without conditions)' },
      ];

      for (const deal of deals) {
        const wrapper = render({
          user, deal, dealFormsCompleted: true, dealHasIssuedFacilitiesToSubmit: true,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should not render at all for deals in status=Submitted and status=Rejected by UKEF', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, status: 'Submitted' },
        { _id: 2, status: 'Rejected by UKEF' },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .notToExist();
      }
    });

    it('should be disabled when dealFormsCompleted and dealHasIssuedFacilitiesToSubmit flags are false', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
        { _id: 3, status: 'Abandoned' },
        { _id: 4, status: 'Acknowledged by UKEF' },
      ];

      const dealFormsCompleted = false;
      const dealHasIssuedFacilitiesToSubmit = false;

      for (const deal of deals) {
        const wrapper = render({
          user, deal, dealFormsCompleted, dealHasIssuedFacilitiesToSubmit,
        });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toBeDisabled();
      }
    });

    it('should be disabled for deals in all other states', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: 'Further Maker\'s input required' },
        { _id: 3, status: 'Abandoned' },
        { _id: 4, status: 'Acknowledged by UKEF' },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toBeDisabled();
      }
    });
  });

  describe('when viewed by a checker', () => {
    it('should not render at all', () => {
      const user = { roles: ['checker'] };
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
        { _id: 3, status: 'Submitted' },
        { _id: 4, status: 'Rejected by UKEF' },
        { _id: 5, status: 'Abandoned' },
        { _id: 6, status: 'Acknowledged by UKEF' },
        { _id: 7, status: 'Accepted by UKEF (without conditions)' },
        { _id: 8, status: 'Accepted by UKEF (with conditions)' },
        { _id: 9, status: "Ready for Checker's approval" },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .notToExist();
      }
    });
  });

  describe('when viewed by a maker checker', () => {
    it('should not render at all for deals in status=Ready for Checker\'s approval with dealFormsCompleted flag set to true', () => {
      const user = { roles: ['maker', 'checker'] };
      const deal = { _id: 4, status: "Ready for Checker's approval" };
      const dealFormsCompleted = true;

      const wrapper = render({ user, deal, dealFormsCompleted });
      wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
        .notToExist();
    });
  });
});
