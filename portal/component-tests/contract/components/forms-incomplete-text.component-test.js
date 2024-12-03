const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');

const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/forms-incomplete-text.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe('when viewed by a maker', () => {
    it("should display when deal status=Draft and status=Further Maker's input required and canFullyCalculateDealSummary flag is false", () => {
      const user = { roles: [MAKER] };
      const deals = [
        { _id: 1, status: 'Draft' },
        { _id: 2, status: "Further Maker's input required" },
      ];

      const canFullyCalculateDealSummary = false;

      for (const deal of deals) {
        const wrapper = render({ user, deal, canFullyCalculateDealSummary });
        const expected = 'Warning: Only the completed facilities will be processed in the financial summary data below.';
        wrapper.expectText('[data-cy="forms-incomplete"]').toRead(expected);
      }
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed by a %s', (nonMakerRole) => {
    it('should not display', () => {
      const user = { roles: [nonMakerRole] };
      const deal = { _id: 1, status: 'Draft' };
      const canFullyCalculateDealSummary = false;

      const wrapper = render({ user, deal, canFullyCalculateDealSummary });
      wrapper.expectElement('[data-cy="forms-incomplete"]').notToExist();
    });
  });
});
