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
      .toHaveAttribute('integrity', 'sha512-ievJl1B6sPB+e1Tsg2P5KpbOinKIoN0XbB1G0CZidrtBa/S9uUtmXiOCwxP6Fr3MlydEVxM4eMU5qaOrG2iLBg==');
  });

  it('should have the correct integrity for "/assets/js/main.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/main.js"]')
      .toHaveAttribute('integrity', 'sha512-+1GWbIJyOjXuih6CAfwX1VVE95ElDmgMfSZ1uuvM9H9lzODE3XJdOeZYfupJE4Y1NSiFNCkCMbfkL+EAPd3Iaw==');
  });

  it('should have the correct integrity for "/assets/js/govukFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/govukFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-Qf5d86Fxyz7znQZhAoxZcoXyLktF0xmKThOztXbmWTcm16psDcx8iAQ/DI5qcRFjxJ3zriwonm5zdTpIspc8yA==');
  });

  it('should have the correct integrity for "/assets/js/mojFrontend.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFrontend.js"]')
      .toHaveAttribute('integrity', 'sha512-oZACuErpjnaaxu4APOJyHBZAk/RW7M5gZ/hVPEBXmbVdcxcdiH89/ey/lqII6wTmpUv87g92RrelMbFXB8qBng==');
  });

  it('should have the correct integrity for "/assets/js/mojFilters.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/mojFilters.js"]')
      .toHaveAttribute('integrity', 'sha512-ByfzBGRfJ1AM3hcN4bl0gILRnr3l9IDe8Um0poccVZ5qEfTpNj5r+rbYXQlEk1tL6zTdrIS2U77Kt4Jxi78Usw==');
  });

  it('should have the correct integrity for "/assets/js/disableFormSubmitOnSubmission.js"', () => {
    wrapper
      .expectElement('script[src="/assets/js/disableFormSubmitOnSubmission.js"]')
      .toHaveAttribute('integrity', 'sha512-uEuYbUapUpwP0obQ48mkUuy6XIqbkwZR/k/QkjNkQzwFe4/zhlaMRRzdfgoJpLmJxWElPw/BjvNCXTo0Y69aLw==');
  });
});
