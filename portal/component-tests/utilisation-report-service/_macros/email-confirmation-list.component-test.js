const componentRenderer = require('../../componentRenderer');

const component = '../templates/utilisation-report-service/_macros/email-confirmation-list.njk';

const render = componentRenderer(component);

describe(component, () => {
  it('should display all emails in a list', () => {
    // Arrange
    const emails = ['email1@ukexportfinance.gov.uk', 'email2@ukexportfinance.gov.uk'];

    // Act
    const wrapper = render({
      emails,
    });

    // Assert
    emails.forEach((email, index) => {
      wrapper.expectText(`li:nth-of-type(${index + 1})`).toRead(email);
    });
  });
});
