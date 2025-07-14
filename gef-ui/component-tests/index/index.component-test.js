const pageRenderer = require('../pageRenderer');

const page = '../templates/application-details-submitted.njk';
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
      .toHaveAttribute('integrity', 'sha512-sgDaf16aYRaOGPX+BF/QQubUw+7zvDtM8okv0JO5nE7A//xKmGv8Sr2Hzi6lBjcPw2Hm1JcyAQMWsxmy1umv9w==');
  });

  it('should have the correct integrity for "/assets/js/govukFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/govukFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-6rZdj3nzFgtzJnekoOCZUBJT6EbYN1n32ZFbAtNc/wrRVWWKJmGZ6LKvKLHZFgtfSfN5LOTh8OxTznYr+F0B8g==');
  });

  it('should have the correct integrity for "/assets/js/mojFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-oZACuErpjnaaxu4APOJyHBZAk/RW7M5gZ/hVPEBXmbVdcxcdiH89/ey/lqII6wTmpUv87g92RrelMbFXB8qBng==');
  });

  it('should have the correct integrity for "/assets/js/maskedInputs.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/maskedInputs.js"]')
      .toHaveAttribute('integrity', 'sha512-ByfzBGRfJ1AM3hcN4bl0gILRnr3l9IDe8Um0poccVZ5qEfTpNj5r+rbYXQlEk1tL6zTdrIS2U77Kt4Jxi78Usw==');
  });

  it('should have the correct integrity for "/assets/js/disableFormSubmitOnSubmission.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/disableFormSubmitOnSubmission.js"]')
      .toHaveAttribute('integrity', 'sha512-mf1ibQA5lxNaMb/56mmj17voBUxRrxo3kx1vtkPz9+vGGookm+vqn8a/5l1fuu2exmAOaz1pLxxoMVZJAlYrFw==');
  });
});
