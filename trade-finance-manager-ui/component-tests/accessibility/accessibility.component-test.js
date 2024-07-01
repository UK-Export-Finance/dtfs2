const { pageRenderer } = require('../pageRenderer');

const page = '../templates/accessibility-statement.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  beforeEach(() => {
    wrapper = render();
  });

  it('should render accessibility statement heading', () => {
    wrapper.expectText('[data-cy="accessibility-statement-heading"]').toRead('Accessibility Statement for the Trade Finance Manager Service');
  });

  it('should render tfm link below accessibility statement heading', () => {
    wrapper.expectElement('[data-cy="tfm-link"]').toExist();
  });

  it('should render ukef products link below accessibility statement heading', () => {
    wrapper.expectElement('[data-cy="ukef-products-list-link"]').toExist();
  });

  it('should render using our website heading', () => {
    wrapper.expectText('[data-cy="using-our-website-heading"]').toRead('Using our website');
  });

  it('should render how accessible this service is heading', () => {
    wrapper.expectText('[data-cy="how-accessible-this-service-is-heading"]').toRead('How accessible this service is');
  });

  it('should render feedback and contact information heading', () => {
    wrapper.expectText('[data-cy="feedback-and-contact-information-heading"]').toRead('Feedback and contact information');
  });

  it('should render reporting accessibility problems with this website heading', () => {
    wrapper.expectText('[data-cy="reporting-accessibility-problems-heading"]').toRead('Reporting accessibility problems with this website');
    wrapper.expectElement('[data-cy="contact-dtfs"]').toExist();
  });

  it('should render enforcement procedure heading', () => {
    wrapper.expectText('[data-cy="enforcement-procedure-heading"]').toRead('Enforcement procedure');
    wrapper.expectElement('[data-cy="contact-eass"]').toExist();
  });

  it('should render technical information about this website accessibility heading', () => {
    wrapper.expectText('[data-cy="technical-information-heading"]').toRead("Technical information about this website's accessibility");
  });

  it('should render compliance status heading', () => {
    wrapper.expectText('[data-cy="compliance-status-heading"]').toRead('Compliance status');
    wrapper.expectElement('[data-cy="guidelines-wcag21"]').toExist();
  });

  it('should render non-compliance with the accessibility regulations heading', () => {
    wrapper.expectText('[data-cy="non-compliance-heading"]').toRead('Non-compliance with the accessibility regulations');
  });

  it('should render what we are doing to improve accessibility heading', () => {
    wrapper.expectText('[data-cy="what-we-are-doing-heading"]').toRead("What we're doing to improve accessibility");
  });

  it('should render preparation of this accessibility statement heading', () => {
    wrapper.expectText('[data-cy="preparation-of-this-accessibility-statement-heading"]').toRead('Preparation of this accessibility statement');
  });
});
