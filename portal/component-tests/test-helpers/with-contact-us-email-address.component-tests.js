const pageRenderer = require('../pageRenderer');

const page = 'login/temporarily-suspended.njk';

module.exports.withContactUsEmailAddressTests = () => {
  describe('with contact us email address tests', () => {
    let wrapper;
    let render;
    let originalContactUsEmailAddress;

    beforeEach(() => {
      render = pageRenderer(page);
      wrapper = render();
    });

    // TODO: DTFS2-7138 remove contact us env vars
    describe('when the contact us email is not set', () => {
      beforeAll(() => {
        originalContactUsEmailAddress = process.env.CONTACT_US_EMAIL_ADDRESS;
        delete process.env.CONTACT_US_EMAIL_ADDRESS;
      });

      afterAll(() => {
        process.env.CONTACT_US_EMAIL_ADDRESS = originalContactUsEmailAddress;
      });

      it('should render link to request a new sign in link', () => {
        wrapper.expectText('[data-cy="dtfs-email-link"]').toRead('DigitalService.TradeFinance@ukexportfinance.gov.uk');
      });
    });

    describe('when the contact us email is set', () => {
      const exampleContactUsEmail = 'exampleContactUs@ukexportfinance.gov.uk';
      beforeAll(() => {
        originalContactUsEmailAddress = process.env.CONTACT_US_EMAIL_ADDRESS;
        process.env.CONTACT_US_EMAIL_ADDRESS = exampleContactUsEmail;
      });

      afterAll(() => {
        process.env.CONTACT_US_EMAIL_ADDRESS = originalContactUsEmailAddress;
      });

      it('should render link to request a new sign in link', () => {
        wrapper.expectText('[data-cy="dtfs-email-link"]').toRead(exampleContactUsEmail);
      });
    });
  });
};
