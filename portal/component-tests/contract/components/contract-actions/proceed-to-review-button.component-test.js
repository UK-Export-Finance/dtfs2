const componentRenderer = require('../../../componentRenderer');
const component = 'contract/components/contract-actions/proceed-to-review-button.njk';
const render = componentRenderer(component);

describe(component, () => {

  describe("when viewed by a maker", () => {

    it("should be enabled for deals in status=Draft and status=Further Maker's input required and when dealFormsCompleted flag is true", () =>{
      const user = {roles: ['maker']};
      const deals = [
        {_id: 1, details:{status:"Draft"}},
        {_id: 2, details:{status:"Further Maker's input required"}},
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
        { _id: 1, details: { status: 'Acknowledged by UKEF' } },
      ];

      const dealFormsCompleted = true;
      const dealHasIssuedFacilitiesToSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, dealFormsCompleted, dealHasIssuedFacilitiesToSubmit });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should be enabled for deals in status=`Acknowledged by UKEF`,`Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)`, `Ready for Checker\'s approval`, `Further Maker\'s input required` when dealHasIssuedFacilitiesToSubmit flag set to true and dealFormsCompleted flag set to false', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, details: { status: 'Acknowledged by UKEF' } },
        { _id: 2, details: { status: 'Accepted by UKEF (with conditions)' } },
        { _id: 3, details: { status: 'Accepted by UKEF (without conditions)' } },
        { _id: 4, details: { status: 'Ready for Checker\'s approval' } },
      ];

      const dealHasIssuedFacilitiesToSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, dealHasIssuedFacilitiesToSubmit });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it('should be enabled for deals in status=`Accepted by UKEF (with conditions)`, `Accepted by UKEF (without conditions)`, regardless of incomplete/completed facilities and dealForms', () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, details: { status: 'Accepted by UKEF (with conditions)' } },
        { _id: 2, details: { status: 'Accepted by UKEF (without conditions)' } },
      ];

      for (const deal of deals) {
        const wrapper = render({ user, deal });
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toLinkTo(`/contract/${deal._id}/ready-for-review`, 'Proceed to review');
      }
    });

    it("should not render at all for deals in status=Submitted and status=Rejected by UKEF", () =>{
      const user = {roles: ['maker']};
      const deals = [
        {_id: 1, details:{status:"Submitted"}},
        {_id: 2, details:{status:"Rejected by UKEF"}},
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .notToExist();
      }
    });

    it("should be disabled when dealFormsCompleted and dealHasIssuedFacilitiesToSubmit flags are false", () =>{
      const user = {roles: ['maker']};
      const deals = [
        { _id: 1, details: { status: "Draft" } },
        { _id: 2, details: { status: "Further Maker's input required" } },
        { _id: 3, details: { status: "Abandoned Deal" } },
        { _id: 4, details: { status: "Acknowledged by UKEF" } },
      ];

      const dealFormsCompleted = false;
      const dealHasIssuedFacilitiesToSubmit = false;

      for (const deal of deals) {
        const wrapper = render({ user, deal, dealFormsCompleted, dealHasIssuedFacilitiesToSubmit});
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toBeDisabled();
      }
    });

    it("should be disabled for deals in all other states", () =>{
      const user = {roles: ['maker']};
      const deals = [
        { _id: 1, details: { status: 'Draft' } },
        { _id: 2, details: { status: 'Further Maker\'s input required' } },
        { _id: 3, details: { status: 'Abandoned Deal' } },
        { _id: 4, details: { status: 'Acknowledged by UKEF' } },
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .toBeDisabled();
      }
    });

  });

  describe("when viewed by a checker", () => {
    it("should not render at all", () =>{
      const user = {roles: ['checker']};
      const deals = [
        {_id: 1, details:{status:"Draft"}},
        {_id: 2, details:{status:"Further Maker's input required"}},
        {_id: 3, details:{status:"Submitted"}},
        {_id: 4, details:{status:"Rejected by UKEF"}},
        {_id: 5, details:{status:"Abandoned Deal"}},
        {_id: 6, details:{status:"Acknowledged by UKEF"}},
        {_id: 7, details:{status:"Accepted by UKEF (without conditions)"}},
        {_id: 8, details:{status:"Accepted by UKEF (with conditions)"}},
        {_id: 9, details:{status:"Ready for Checker's approval"}},
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectPrimaryButton('[data-cy="ProceedToReview"]')
          .notToExist();
      }
    });
  });
});
