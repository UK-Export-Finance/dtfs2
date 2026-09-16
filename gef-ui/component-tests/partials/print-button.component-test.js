const pageRenderer = require('../pageRenderer');

const page = '../templates/partials/print-button.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should have the correct integrity for "/assets/js/printPage.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/printPage.js"]')
      .toHaveAttribute('integrity', 'sha512-919y7jPivlBPrwsm32uCS3R9hRl/S8CM02T9vA07Cs9sHnbIIVyPpD/qAaIhMLisYIcPmo0anUnmb0HWemGn6g==');
  });

  it('should render print page button with type="button" attribute to prevent form submission', () => {
    wrapper.expectElement('[data-cy="print-button"]').toExist();
    wrapper.expectElement('[data-cy="print-button"]').toHaveAttribute('type', 'button');
  });
});
