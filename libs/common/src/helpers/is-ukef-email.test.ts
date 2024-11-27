import { isUkefEmail } from './is-ukef-email';

describe('isUkefEmail', () => {
  const invalidEmails = ['', ' ', 'test', 'test@', 'test@example.com', 'test@gov.uk'];
  const validEmails = ['maker1@ukexportfinance.gov.uk', 'first.last@ukexportfinance.gov.uk'];

  it.each(invalidEmails)("should return false for '%s'", (email: string) => {
    // Act
    const response = isUkefEmail(email);

    // Assert
    expect(response).toBeFalsy();
  });

  it.each(validEmails)("should return true for '%s'", (email: string) => {
    // Act
    const response = isUkefEmail(email);

    // Assert
    expect(response).toBeTruthy();
  });
});
