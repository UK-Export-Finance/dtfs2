const componentRenderer = require('../../componentRenderer');
const component = 'contract/components/abandon-deal-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe("when viewed by a maker", () => {

    it("should be enabled for deals in status=Draft and status=Further Maker's input required", () =>{
      const user = {_id: 123, roles: ['maker']};
      const deals = [
        {
          _id: 1,
          status: 'Draft',
          details: {
            maker: { _id: 123 },
          },
        },
        {
          _id: 2,
          status: 'Further Maker\'s input required',
          details: {
            maker: { _id: 123 },
          },
        },
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectLink('[data-cy="AbandonLink"]')
          .toLinkTo(`/contract/${deal._id}/delete`, 'Abandon');
      }
    });

    it("should not render at all for deals in any other status", () =>{
      const user = {_id: 123, roles: ['maker']};
      const deals = [
        {
          _id: 1,
          status: 'Submitted',
          details: {
            maker: { _id: 123 },
          },
        },
        {
          _id: 2,
          status: 'Rejected by UKEF',
          details: {
            maker: { _id: 123 },
          },
        },
        {
          _id: 3,
          status: 'Abandoned',
          details: {
            maker: { _id: 123 },
          },
        },
        {
          _id: 4,
          status: 'Acknowledged by UKEF',
          details: {
            maker: { _id: 123 },
          },
        },
        {
          _id: 5,
          status: 'Accepted by UKEF (without conditions)',
          details: {
            maker: { _id: 123 },
          },
        },
        {
          _id: 6,
          status: 'Accepted by UKEF (with conditions)',
          details: {
            maker: { _id: 123 },
          },
        },
        {
          _id: 7,
          status: 'Ready for Checker\'s approval',
          details: {
            maker: { _id: 123 },
          },
        },
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectLink('[data-cy="AbandonLink"]')
          .notToExist();
      }
    });

  });

  describe("when viewed by a checker", () => {
    it("should not render at all", () =>{
      const user = {roles: ['checker']};
      const deals = [
        {_id: 1, status: 'Draft'},
        {_id: 2, status: 'Further Maker\'s input required'},
        {_id: 3, status: 'Submitted'},
        {_id: 4, status: 'Rejected by UKEF'},
        {_id: 5, status: 'Abandoned'},
        {_id: 6, status: 'Acknowledged by UKEF'},
        {_id: 7, status: 'Accepted by UKEF (without conditions)'},
        {_id: 8, status: 'Accepted by UKEF (with conditions)'},
        {_id: 9, status: 'Ready for Checker\'s approval'},
      ];

      for (const deal of deals) {
        const wrapper = render({user, deal});
        wrapper.expectLink('[data-cy="AbandonLink"]')
          .notToExist();
      }
    });
  });
});
