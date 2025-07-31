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
      .toHaveAttribute('integrity', 'sha512-20FWOk4snpPkXsXgn1/AumRC2VDLABGWYHoPDTRPpFfuf/hwmsctkx5eenEG4f8+Xp7Otwd2BcZXXCBks3E0rg==');
  });
});
