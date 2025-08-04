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
      .toHaveAttribute('integrity', 'sha512-HtsuLN2MelCp86PdykzQp6/zZ1juBUu9JJKs4scAzSjbMZ1/DRZ8/NQMBGlnxiP/pr11v7rqKbEzWhxLzHigwA==');
  });
});
