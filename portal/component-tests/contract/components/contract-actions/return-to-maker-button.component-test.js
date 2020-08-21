const componentRenderer = require('../../../componentRenderer');
const component = 'contract/components/contract-actions/return-to-maker-button.njk';
const render = componentRenderer(component);

describe(component, () => {

  describe('when viewed by a checker with userCanSubmit param set to true', () => {

    it("should be enabled for deals in status=Ready for Checker's approval", () =>{
      const user = {roles: ['checker']};
      const deals = [
        {_id: 1, details:{status:"Ready for Checker's approval"}},
      ];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectSecondaryButton('[data-cy="ReturnToMaker"]')
          .toLinkTo(`/contract/${deal._id}/return-to-maker`, 'Return to Maker');
      }
    });

    it("should not render at all for deals in status=Submitted and status=Rejected by UKEF", () =>{
      const user = {roles: ['checker']};
      const deals = [
        {_id: 1, details:{status:"Submitted"}},
        {_id: 2, details:{status:"Rejected by UKEF"}},
      ];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectSecondaryButton('[data-cy="ReturnToMaker"]')
          .notToExist();
      }
    });

    it("should be disabled for deals in all other states", () =>{
      const user = {roles: ['checker']};
      const deals = [
        {_id: 1, details:{status:"Draft"}},
        {_id: 2, details:{status:"Abandoned Deal"}},
        {_id: 3, details:{status:"Acknowledged by UKEF"}},
        {_id: 4, details:{status:"Accepted by UKEF (without conditions)"}},
        {_id: 5, details:{status:"Accepted by UKEF (with conditions)"}},
        {_id: 6, details:{status:"In progress by UKEF"}},
      ];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit});
        wrapper.expectSecondaryButton('[data-cy="ReturnToMaker"]')
          .toBeDisabled();
      }
    });
  });

  describe('when viewed by a user with checker AND maker roles, with userCanSubmit param set to true', () => {
    it('should be enabled', () => {
      const user = { roles: ['maker', 'checker'] };
      const deals = [
        { _id: 1, details: { status: 'Submitted' } },
        { _id: 2, details: { status: 'Rejected by UKEF' } },
      ];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectSecondaryButton('[data-cy="ReturnToMaker"]')
          .toLinkTo(`/contract/${deal._id}/return-to-maker`, 'Return to Maker');
      }
    });

    it('should NOT render when deal status is `Draft`', () => {
      const user = { roles: ['maker', 'checker'] };
      const deals = [
        { _id: 1, details: { status: 'Draft' } },
      ];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ReturnToMaker"]').notToExist();
      }
    });

    it('should NOT render when deal status is `Further Maker\'s input required`', () => {
      const user = { roles: ['maker', 'checker'] };
      const deals = [
        { _id: 1, details: { status: 'Further Maker\'s input required' } },
      ];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ReturnToMaker"]').notToExist();
      }
    });

    it('should NOT render when deal status is `Acknowledged by UKEF`', () => {
      const user = { roles: ['maker', 'checker'] };
      const deals = [
        { _id: 1, details: { status: 'Further Maker\'s input required' } },
      ];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ReturnToMaker"]').notToExist();
      }
    });

    it('should NOT render when deal status is `In progress by UKEF`', () => {
      const user = { roles: ['maker', 'checker'] };
      const deals = [
        { _id: 1, details: { status: 'In progress by UKEF' } },
      ];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ReturnToMaker"]').notToExist();
      }
    });

    it('should NOT render when deal status is `Accepted by UKEF (without conditions)`', () => {
      const user = { roles: ['maker', 'checker'] };
      const deals = [
        { _id: 1, details: { status: 'Accepted by UKEF (without conditions)' } },
      ];
      const userCanSubmit = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectElement('[data-cy="ReturnToMaker"]').notToExist();
      }
    });

  });

  describe('when viewed by a checker with userCanSubmit param set to false', () => {
    it('should not render at all', () => {
      const user = { roles: ['checker'] };
      const deals = [
        { _id: 1, details: { status: 'Ready for Checker\'s approval' } },
        { _id: 2, details: { status: 'Submitted' } },
        { _id: 3, details: { status: 'Rejected by UKEF' } },
        { _id: 4, details: { status: 'Draft' } },
        { _id: 5, details: { status: 'Further Maker\'s input required' } },
        { _id: 6, details: { status: 'Abandoned Deal' } },
        { _id: 7, details: { status: 'Acknowledged by UKEF' } },
        { _id: 8, details: { status: 'Accepted by UKEF (without conditions)' } },
        { _id: 9, details: { status: 'Accepted by UKEF (with conditions)' } },
      ];
      const userCanSubmit = false;

      for (const deal of deals) {
        const wrapper = render({ user, deal, userCanSubmit });
        wrapper.expectPrimaryButton('[data-cy="ProceedToSubmit"]').notToExist();
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
        wrapper.expectSecondaryButton('[data-cy="ReturnToMaker"]')
          .notToExist();
      }
    });
  });
});
