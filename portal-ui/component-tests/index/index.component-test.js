const pageRenderer = require('../pageRenderer');

const page = '../templates/login/index.njk';
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

  it('should ensure the mask icon link is correct', () => {
    wrapper.expectElement('link[rel="mask-icon"]').toHaveAttribute('href', '/assets/rebrand/images/govuk-icon-mask.svg');
  });

  it('should ensure the mask icon colour is correct', () => {
    wrapper.expectElement('link[rel="mask-icon"]').toHaveAttribute('color', '#1d70b8');
  });

  it('should ensure the manifest link is correct', () => {
    wrapper.expectElement('link[rel="manifest"]').toHaveAttribute('href', '/assets/rebrand/manifest.json');
  });

  it('should ensure the stylesheet link is correct', () => {
    wrapper.expectElement('link[rel="stylesheet"]').toHaveAttribute('href', '/assets/css/styles.css');
  });

  it('should have the correct integrity for "/assets/js/jsEnabled.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/jsEnabled.js"]')
      .toHaveAttribute('integrity', 'sha512-BZmKCksPLPXsFlYmd1MUEDLllt/d7vn1jLdU6FA1Y7hpzaOK7Aj9wwS3alwFEl+tlS5Md3CmwjI98F5Ggsg92Q==');
  });

  it('should have the correct integrity for "/assets/js/main.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/main.js"]')
      .toHaveAttribute('integrity', 'sha512-XP3XIBhSllKsbn+fbIKTR+4qhsqtT31XFLd2RijeherTEnzYtMqsab6R0WkWyRRm49rKl81LdeKA8CqfVRGeCQ==');
  });

  it('should have the correct integrity for "/assets/js/govukFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/govukFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-2hKXaTLCc68oh6/HO5vFnfpiV/R6PGeTyYO/LO0LPWWL8X4TYCye4B1+myeskdcntXTmsuNuUmGbO3lbZ7OFIg==');
  });

  it('should have the correct integrity for "/assets/js/mojFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-oZACuErpjnaaxu4APOJyHBZAk/RW7M5gZ/hVPEBXmbVdcxcdiH89/ey/lqII6wTmpUv87g92RrelMbFXB8qBng==');
  });

  it('should have the correct integrity for "/assets/js/maskedInputs.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/maskedInputs.js"]')
      .toHaveAttribute('integrity', 'sha512-9fwf8xy1jVf1TvX8ex+8QhAiJfYPN18JXqxt2ULvQ5Y7kO8ZfPTfthqeL35unzb9zCmlpwhRQ6/g4rX6kc+zNQ==');
  });

  it('should have the correct integrity for "/assets/js/mojFilters.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFilters.js"]')
      .toHaveAttribute('integrity', 'sha512-ByfzBGRfJ1AM3hcN4bl0gILRnr3l9IDe8Um0poccVZ5qEfTpNj5r+rbYXQlEk1tL6zTdrIS2U77Kt4Jxi78Usw==');
  });

  it('should have the correct integrity for "/assets/js/disableFormSubmitOnSubmission.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/disableFormSubmitOnSubmission.js"]')
      .toHaveAttribute('integrity', 'sha512-mf1ibQA5lxNaMb/56mmj17voBUxRrxo3kx1vtkPz9+vGGookm+vqn8a/5l1fuu2exmAOaz1pLxxoMVZJAlYrFw==');
  });
});
