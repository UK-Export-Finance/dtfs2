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
      .toHaveAttribute('integrity', 'sha512-O546HgQDZqMaRX/qgAEzkTWV1U7AyGwmX4hmR21EUH3JTSw/axxt+UIPhPUOVAzdmX4FUOHEpk8O48iy+vCGBQ==');
  });

  it('should have the correct integrity for "/assets/js/main.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/main.js"]')
      .toHaveAttribute('integrity', 'sha512-7aDW3so/vpgcvlLxvxADPiYrXwx/eligfGwZLQD16Jlkgmp+3g0G8drBjhZ+TC2vyv5ZBh/xq1L1MZFUAz+4pQ==');
  });

  it('should have the correct integrity for "/assets/js/govukFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/govukFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-o0KaKF4ummQGvu8rUZRscbd8CI0brZMQdjHrVNLD12TOUywTk1hiFRE89iyttfCGm9Ar44BqToAZBJHjKB2zGQ==');
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
      .toHaveAttribute('integrity', 'sha512-FIrMtAeQm0Bpti8237dYxBHBjSQeJFItMWiCNwq6PdDRBcIa5m5Y31W60bAWgBYWZ+ZCON2eS2hJBUynr5K/oA==');
  });

  it('should have the correct integrity for "/assets/js/disableFormSubmitOnSubmission.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/disableFormSubmitOnSubmission.js"]')
      .toHaveAttribute('integrity', 'sha512-mf1ibQA5lxNaMb/56mmj17voBUxRrxo3kx1vtkPz9+vGGookm+vqn8a/5l1fuu2exmAOaz1pLxxoMVZJAlYrFw==');
  });
});
