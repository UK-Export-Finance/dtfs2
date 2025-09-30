const pageRenderer = require('../pageRenderer');

const page = '../templates/partials/upload-supporting-documents.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should have the correct integrity for "/assets/js/multiFileUpload.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/multiFileUpload.js"]')
      .toHaveAttribute('integrity', 'sha512-25jKJXvf1G3dKY2ABCw8GVMEPlFfFwzd2XhE45ILcUH61mDWzq9VA37hwIWMXUOSHvOEy/Iozm4zPiVOmJOUNQ==');
  });
});
