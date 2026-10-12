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
      .toHaveAttribute('integrity', 'sha512-bPTyeoR4xlLkjM947l89cxD/ed/CKBx2Hh2bcpE7udjebeaAX0C7biH1BsM1aZbtVxsUIFTC9WzYj9JqIpZL7w==');
  });
});
