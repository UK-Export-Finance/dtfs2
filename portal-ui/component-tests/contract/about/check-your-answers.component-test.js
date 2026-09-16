const pageRenderer = require('../../pageRenderer');
const deal = require('../../fixtures/deal-fully-completed');

const component = 'contract/about/about-supply-check-your-answers.njk';
const render = pageRenderer(component);

describe(component, () => {
  let wrapper;
  const { submissionDetails } = deal;

  beforeEach(() => {
    wrapper = render(submissionDetails);
  });

  describe('print button', () => {
    it('should render print button', () => {
      wrapper.expectElement('[data-cy="print-button"]').toExist();
      wrapper.expectText('[data-cy="print-button"]').toRead('Print');
    });

    it('should have the correct integrity value', () => {
      wrapper
        .expectElement('script[src="/assets/js/printPage.js"]')
        .toHaveAttribute('integrity', 'sha512-919y7jPivlBPrwsm32uCS3R9hRl/S8CM02T9vA07Cs9sHnbIIVyPpD/qAaIhMLisYIcPmo0anUnmb0HWemGn6g==');
    });
  });
});
