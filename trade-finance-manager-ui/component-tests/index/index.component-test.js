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
      .toHaveAttribute('integrity', 'sha512-BLhltBWOGogiNck88Bgk9ZP60WzkF0M4UDKNXASvMQ0XBcLRtMCqs77xMkkL+crGcCqpKtuOkkeuTvpTQFuzIA==');
  });

  it('should have the correct integrity for "/assets/js/govukFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/govukFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-Vk2b9tAD+b3UW0QRRQYYlVt7TYXoL25A8HrougokdITdzQLR6oWerqvbggafTBDYOtpO64j3n8zKjujsJkY91Q==');
  });

  it('should have the correct integrity for "/assets/js/mojFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-Qk6Yl7rQlrEMujbcG1eTJ+aqZvUDj8FP4Xexy9FeU1SrY302u2vD7fqq3rq7BGvwhOcTdAlUKi1zmEOqHgU+1w==');
  });

  it('should have the correct integrity for "/assets/js/disableFormSubmitOnSubmission.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/disableFormSubmitOnSubmission.js"]')
      .toHaveAttribute('integrity', 'sha512-tCINlYTcYERel2bdysTMl5KaemDdEyog5JSS3hYQqHS6ZIyT4ATLu4oTPerbZ+vAOn4AAzDEsRBSQVacGhoieQ==');
  });

  it('should have the correct integrity for "/assets/js/ssoRedirectAutoSubmit.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/ssoRedirectAutoSubmit.js"]')
      .toHaveAttribute('integrity', 'sha512-YEZQKS3HeCijT1fixW7Q/tgkNdT1fzXDXPzTog2tCT04sw7xDpdHRSv5MTkD2UUsw0LCXf8Wkgp9XIaxFtSL+g==');
  });
});
