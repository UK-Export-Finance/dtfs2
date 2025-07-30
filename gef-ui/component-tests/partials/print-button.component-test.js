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
      .toHaveAttribute('integrity', 'sha512-COV1ZxdaFcvJFaLBxO/S9vxb6lx0vun8S4gYf82aSfr/OCjWt6yeEWTeaLYS2crz70vNnQEdoDEg9JojLHqU5A==');
  });
});
