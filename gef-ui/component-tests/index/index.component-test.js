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
      .toHaveAttribute('integrity', 'sha512-ZvpHdsSmhvDFv+zPaA8MBtsgAGQY5eLphf7sAGDEksUkRIOihhQmCIguF3fyUB2iQANpQQZ4lJNIx5x4y797ag==');
  });

  it('should have the correct integrity for "/assets/js/govukFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/govukFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-Sq1sgmniwG0N7ZtPPA/sa1V8XUDXofLNZwOO9cNVfjzHINSByAQqWX6YczVyMzmf+DAZg75KDT0irDxcG7K3qw==');
  });

  it('should have the correct integrity for "/assets/js/mojFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-JjqTOuR1AIiMbPvcdQ/8AM1/G5QukY5HlF+0m72vVO/YCJ6Qw0WWyNbELwnl8kFOcfiZEi1xNplQLTwk/pGupw==');
  });

  it('should have the correct integrity for "/assets/js/mojFilters.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFilters.js"]')
      .toHaveAttribute('integrity', 'sha512-H72fn1gjiejtjsp0mzVBXRNXy4tOJESuwUYo6G2dO1SJcQJQFCHL9cX0lynZBzYj9OpEDGm0ru62VW3Epz9f/w==');
  });

  it('should have the correct integrity for "/assets/js/disableFormSubmitOnSubmission.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/disableFormSubmitOnSubmission.js"]')
      .toHaveAttribute('integrity', 'sha512-mf1ibQA5lxNaMb/56mmj17voBUxRrxo3kx1vtkPz9+vGGookm+vqn8a/5l1fuu2exmAOaz1pLxxoMVZJAlYrFw==');
  });
});
