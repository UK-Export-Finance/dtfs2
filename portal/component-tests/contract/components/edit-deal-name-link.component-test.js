const componentRenderer = require('../../componentRenderer');
const component = 'contract/components/edit-deal-name-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe("when viewed by the maker who created the deal", () => {

    it("should be enabled for deals in status=Draft and status=Further Maker's input required", () =>{
      const user = {_id: 123, roles: ['maker']};
      const deals = [
        {_id: 1, details:{status:"Draft", maker:{_id:123}}},
        {_id: 2, details:{status:"Further Maker's input required", maker:{_id:123}}},
      ];

      for (const deal of deals) {
        const $ = render({user, deal});
        $.expectLink('[data-cy="EditDealName"]').toLinkTo(`/contract/${deal._id}/edit-name`);
      }
    });

    it("should not render at all for deals in any other status", () =>{
      const user = {_id: 123, roles: ['maker']};
      const deals = [
        {_id: 1, details:{status:"Submitted", maker:{_id:123}}},
        {_id: 2, details:{status:"Rejected by UKEF", maker:{_id:123}}},
        {_id: 3, details:{status:"Abandoned Deal", maker:{_id:123}}},
        {_id: 4, details:{status:"Acknowledged by UKEF", maker:{_id:123}}},
        {_id: 5, details:{status:"Accepted by UKEF (without conditions)", maker:{_id:123}}},
        {_id: 6, details:{status:"Accepted by UKEF (with conditions)", maker:{_id:123}}},
        {_id: 7, details:{status:"Ready for Checker's approval", maker:{_id:123}}},
      ];

      for (const deal of deals) {
        const $ = render({user, deal});
        $.expectLink('[data-cy="EditDealName"]').notToExist();
      }
    });

  });

  describe("when viewed by a maker who did not create the deal", () => {

    it("should not render at all", () =>{
      const user = {_id: 666, roles: ['maker']};
      const deals = [
        {_id: 1, details:{status:"Draft", maker:{_id:123}}},
        {_id: 2, details:{status:"Further Maker's input required", maker:{_id:123}}},
        {_id: 3, details:{status:"Submitted", maker:{_id:123}}},
        {_id: 4, details:{status:"Rejected by UKEF", maker:{_id:123}}},
        {_id: 5, details:{status:"Abandoned Deal", maker:{_id:123}}},
        {_id: 6, details:{status:"Acknowledged by UKEF", maker:{_id:123}}},
        {_id: 7, details:{status:"Accepted by UKEF (without conditions)", maker:{_id:123}}},
        {_id: 8, details:{status:"Accepted by UKEF (with conditions)", maker:{_id:123}}},
        {_id: 9, details:{status:"Ready for Checker's approval", maker:{_id:123}}},
      ];

      for (const deal of deals) {
        const $ = render({user, deal});
        $.expectLink('[data-cy="EditDealName"]').notToExist();
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
        const $ = render({user, deal});
        $.expectLink('[data-cy="EditDealName"]').notToExist();
      }
    });
  });
});
