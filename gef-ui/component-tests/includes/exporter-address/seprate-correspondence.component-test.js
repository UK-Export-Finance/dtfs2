const pageRenderer = require('../../pageRenderer');

const page = '../templates/includes/exporters-address/separate-correspondence.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should have the correct integrity for "/gef/assets/js/correspondenceAddress.js"', () => {
    wrapper
      .expectElement('script[src="/gef/assets/js/correspondenceAddress.js"]')
      .toHaveAttribute('integrity', 'sha512-POMOdrbMY0YJYd3PGp0HV3EW4jb/HI6QKbJtNWpqVcxZU6ytAdUbz5D6ns8d/d/Mv0HO1rwl2UqECaQu1Itp4A==');
  });
});
