const componentRenderer = require('../../componentRenderer');
const component = 'contract/components/review-eligibility-checklist-link.njk';
const render = componentRenderer(component);

describe(component, () => {

  describe("when viewed by a checker", () => {

    it("should display for deals in status=Ready for Checker's approval", () =>{
      const user = {roles: ['checker']};
      const deals = [
        {_id: 1, details:{status:"Ready for Checker's approval"}},
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectLink('[data-cy="reviewEligibilityChecklistForm"]')
          .toLinkTo(`/contract/${deal._id}/eligibility/supporting-documentation`, 'Review your eligibility checklist form');
      }
    });

    it("should not render at all for deals in any other status", () =>{
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
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectText('[data-cy="reviewEligibilityChecklistForm"]')
          .notToExist();
      }
    });

  });

  describe("when viewed by a maker", () => {

    it("should not render at all", () =>{
      const user = {roles: ['maker']};
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
        wrapper.expectText('[data-cy="reviewEligibilityChecklistForm"]')
          .notToExist();
      }
    });
  });

});
