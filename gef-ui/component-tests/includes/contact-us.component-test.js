const page = 'includes/contact-us.njk';
const mockContactUsEmailAddress = 'test-contact-us@ukexportfinance.gov.uk';

process.env.CONTACT_US_EMAIL_ADDRESS = mockContactUsEmailAddress;

// Only render the page after env variable has been changed
const pageRenderer = require('../pageRenderer');

describe(page, () => {
  const originalContactUsEmailAddress = process.env.CONTACT_US_EMAIL_ADDRESS;
  const render = pageRenderer(page);
  const wrapper = render();

  afterAll(() => {
    process.env.CONTACT_US_EMAIL_ADDRESS = originalContactUsEmailAddress;
  });

  it('should render the contact us email address', () => {
    wrapper.expectText('[data-cy="contact_us_email"]').toRead(mockContactUsEmailAddress);
  });

  it('should render the respond timeframe text', () => {
    wrapper.expectText('[data-cy="contact_us_timeframe"]').toRead('We aim to respond within 2 working days');
  });
});
