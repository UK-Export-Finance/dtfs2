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
      .toHaveAttribute('integrity', 'sha512-vWSO+xGMEyhCR13qFLeewczuQWaCVnZz609AR6NPrTd57OeaoIwCxcB25fxyfzNA62GR98PCtWlftkoK3J8EAg==');
  });
});
