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
      .toHaveAttribute('integrity', 'sha512-6LHYtB3N14JvsgpSmL6+C1ua5pFCAdLk5UbwqbnUCfufAfGLwqWl2j6nfLFghIAbUDGtGrnQXDDDOHl+SPAYGw==');
  });

  it('should have the correct integrity for "/assets/js/mojFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-mc0AEQnun5FfrCSQPJsQfYarvqgzmdeODHcYB0kCF0TG0PpDYvr33Q+WhknzXjlMofCqPzS8QYEUc6G4/HDKbQ==');
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
