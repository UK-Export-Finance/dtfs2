const componentRenderer = require('../../componentRenderer');
const component = 'contract/components/please-complete-all-forms-text.njk';
const render = componentRenderer(component);

describe(component, () => {

  describe("when viewed by a maker", () => {

    it("should display when deal status=Draft and status=Further Maker's input required and dealFormsCompleted flag is false", () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, details: { status: "Draft" } },
        { _id: 2, details: { status: "Further Maker's input required" } },
      ];

      const dealFormsCompleted = false;

      for (const deal of deals) {
        const wrapper = render({ user, deal, dealFormsCompleted });
        wrapper.expectText('[data-cy="canProceed"]').toRead('Please complete all form sections in order to submit your Supply Contract.');
      }
    });

    it("should not render at all for deals in any other status", () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, details: { status: "Submitted" } },
        { _id: 2, details: { status: "Rejected by UKEF" } },
        { _id: 3, details: { status: "Abandoned Deal" } },
        { _id: 4, details: { status: "Acknowledged by UKEF" } },
        { _id: 5, details: { status: "Accepted by UKEF (without conditions)" } },
        { _id: 6, details: { status: "Accepted by UKEF (with conditions)" } },
        { _id: 7, details: { status: "Ready for Checker's approval" } },
      ];


      const dealFormsCompleted = true;

      for (const deal of deals) {
        const wrapper = render({ user, deal, dealFormsCompleted });
        wrapper.expectText('[data-cy="canProceed"]').notToExist();
      }
    });
  });
});
