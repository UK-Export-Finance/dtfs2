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
      .toHaveAttribute('integrity', 'sha512-ekWMPm/25Rov8i1Ph0RQnMDwR+0NeNIof2J8Ysb+44fE6zj/LGNnDvFwM56fYZ84L1Npm9twIIfhB9UBClMgaQ==');
  });
});
