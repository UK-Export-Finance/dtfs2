const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/forms-incomplete-text.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe('when viewed by a maker', () => {

    it("should display when deal status=Draft and status=Further Maker's input required and dealFormsCompleted flag is false", () => {
      const user = { roles: ['maker'] };
      const deals = [
        { _id: 1, details: { status: 'Draft' } },
        { _id: 2, details: { status: "Further Maker's input required" } },
      ];

      const dealFormsCompleted = false;

      for (const deal of deals) {
        const wrapper = render({ user, deal, dealFormsCompleted });
        const expected = 'Warning: Some of your Transaction forms are incomplete. Only the completed facilities will be processed in the financial summary data below.';
        wrapper.expectText('[data-cy="forms-incomplete"]').toRead(expected);
      }
    });
  });
});
