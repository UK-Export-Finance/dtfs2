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
      .toHaveAttribute('integrity', 'sha512-g1HzaDv34IFAU3It1aKT24TNtHXolnsFJLVFQpC9Q4HSaYdQHx35l5nWyj1H0EmKhVJXFVCvq1jIgIr2Eie/Yg==');
  });

  it('should have the correct integrity for "/assets/js/govukFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/govukFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-meJh8DqVSYqEXqYIY4Or4XFosvh+4dqNLfupJcXWAkqteV9lm6F8itLdclGQRT+LZAt+cAsqgRbOozdP9L48Kg==');
  });

  it('should have the correct integrity for "/assets/js/mojFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-ljKDUbfOvsIQVXo4W6bWa+xhYmerVpGhXUzyOLcVKZep/ue784xBXyrXGRJgBIqqiMoPtaysSKYsttV23UlxgA==');
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
