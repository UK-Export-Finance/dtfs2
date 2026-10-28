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
    wrapper.expectElement('link[rel="stylesheet"]').toHaveAttribute('href', '/gef/assets/css/styles.css');
  });

  it('should have the correct integrity for "/assets/js/jsEnabled.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/jsEnabled.js"]')
      .toHaveAttribute('integrity', 'sha512-O546HgQDZqMaRX/qgAEzkTWV1U7AyGwmX4hmR21EUH3JTSw/axxt+UIPhPUOVAzdmX4FUOHEpk8O48iy+vCGBQ==');
  });

  it('should have the correct integrity for "/assets/js/main.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/main.js"]')
      .toHaveAttribute('integrity', 'sha512-lCZxk0AeWok8xYCn1xtyjUU/VZuxlqazzCDYyjzmYjaUReXyx4IylURV9b8p/F1+QdbCcWY65tx+/y5D3g78kg==');
  });

  it('should have the correct integrity for "/assets/js/govukFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/govukFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-E5s1Jh+Lijujvt+xMchui1PdoaSj+/jdosLV8IWFb2Sf0NJ1nQgOoH4WsR0cXnGstKN/B6+TeWpqE2q2qOdA7A==');
  });

  it('should have the correct integrity for "/assets/js/mojFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-ASkdnOg3AR3UHi4u6hSa3AwbaMM4dLBH0306zKc26bUNqHzpsd9b0WhBRyWJlnP1le4kxDAZBmF/2yKyKNjPhg==');
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
