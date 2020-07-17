const componentRenderer = require('../../../componentRenderer');
const component = 'contract/components/contract-actions/proceed-to-submit-button.njk';
const render = componentRenderer(component);

describe(component, () => {

  describe("when viewed by a checker", () => {

    it("should be enabled for deals in status=Ready for Checker's approval", () =>{
      const user = {roles: ['checker']};
      const deals = [
        {_id: 1, details:{status:"Ready for Checker's approval"}},
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]')
          .toLinkTo(`/contract/${deal._id}/confirm-submission`, 'Proceed to submit');
      }
    });

    it("should not render at all for deals in status=Submitted and status=Rejected by UKEF", () =>{
      const user = {roles: ['checker']};
      const deals = [
        {_id: 1, details:{status:"Submitted"}},
        {_id: 2, details:{status:"Rejected by UKEF"}},
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]')
          .notToExist();
      }
    });

    it("should be disabled for deals in all other states", () =>{
      const user = {roles: ['checker']};
      const deals = [
        {_id: 1, details:{status:"Draft"}},
        {_id: 2, details:{status:"Further Maker's input required"}},
        {_id: 3, details:{status:"Abandoned Deal"}},
        {_id: 4, details:{status:"Acknowledged by UKEF"}},
        {_id: 5, details:{status:"Accepted by UKEF (without conditions)"}},
        {_id: 6, details:{status:"Accepted by UKEF (with conditions)"}},
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]')
          .toBeDisabled();
      }
    });

  });

  describe("when viewed by a maker", () => {
    it("should not render at all", () =>{
      const user = {roles: ['maker']};
      const deals = [
        {_id: 1, details:{status:"Submitted"}},
        {_id: 2, details:{status:"Rejected by UKEF"}},
        {_id: 3, details:{status:"Abandoned Deal"}},
        {_id: 4, details:{status:"Acknowledged by UKEF"}},
        {_id: 5, details:{status:"Accepted by UKEF (without conditions)"}},
        {_id: 6, details:{status:"Accepted by UKEF (with conditions)"}},
        {_id: 7, details:{status:"Ready for Checker's approval"}},
        {_id: 8, details:{status:"Submitted"}},
        {_id: 9, details:{status:"Rejected by UKEF"}},
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]')
          .notToExist();
      }
    });
  });
});
