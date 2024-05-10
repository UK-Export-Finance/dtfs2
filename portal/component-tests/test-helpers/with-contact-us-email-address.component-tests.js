const pageRenderer = require('../pageRenderer');

module.exports.withContactUsEmailAddressTests = ({ page }) => {
  describe('with contact us email address tests', () => {
    let wrapper;
    let render;
    let originalContactUsEmailAddress;
    const exampleContactUsEmail = 'exampleContactUs@ukexportfinance.gov.uk';

    beforeAll(() => {
      originalContactUsEmailAddress = process.env.CONTACT_US_EMAIL_ADDRESS;
    });

    beforeEach(() => {
      process.env.CONTACT_US_EMAIL_ADDRESS = exampleContactUsEmail;

      render = pageRenderer(page);
      wrapper = render();
    });

    afterAll(() => {
      process.env.CONTACT_US_EMAIL_ADDRESS = originalContactUsEmailAddress;
    });

    it('should render link to request a new sign in link', () => {
      wrapper.expectText('[data-cy="dtfs-email-link"]').toRead(exampleContactUsEmail);
    });
  });
};
