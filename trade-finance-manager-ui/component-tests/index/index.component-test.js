const { pageRenderer } = require('../pageRenderer');

const page = '../templates/login.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render skip to main content link', () => {
    wrapper.expectLink('[data-cy="skip-link"]').toLinkTo('#main-content', 'Skip to main content');
    wrapper.expectElement('#main-content').toExist();
  });

  it('should have the correct integrity for "/assets/js/main.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/main.js"]')
      .toHaveAttribute('integrity', 'sha512-545n5sADavrx6J7M+35OK8aO8vYy53k94cTSHazqdHnCvUGnAv0hSchAhJ5sr5BAliS3Z+y3MOVMRZg7XYpKIw==');
  });

  it('should have the correct integrity for "/assets/js/govukFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/govukFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-FuuuQVS/0e5ef08V1jgkT97sMp7KS10N7j8NbslD37oB9fEkJJaYNFg9IcrDdPQMjh05MkS11ReVOHXxAoLItg==');
  });

  it('should have the correct integrity for "/assets/js/mojFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-w4sOebhAk04XQ0LvXEq1iKg/iAmoDI8AmVhVQdQ3hlnKl7jxZF6feZnPIR1pMK26iy4LIwwS48DZIH2L63q8rw==');
  });

  it('should have the correct integrity for "/assets/js/disableFormSubmitOnSubmission.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/disableFormSubmitOnSubmission.js"]')
      .toHaveAttribute('integrity', 'sha512-j01KJMmYleOKhRiLGNqRqMEOqCPUj5GytCJGU0cQxxFLHmrTSPjTPoxIvyZ16gPQG2cUUSPOzeiDGfKMYms+WA==');
  });

  it('should have the correct integrity for "/assets/js/ssoRedirectAutoSubmit.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/ssoRedirectAutoSubmit.js"]')
      .toHaveAttribute('integrity', 'sha512-YEZQKS3HeCijT1fixW7Q/tgkNdT1fzXDXPzTog2tCT04sw7xDpdHRSv5MTkD2UUsw0LCXf8Wkgp9XIaxFtSL+g==');
  });
});
