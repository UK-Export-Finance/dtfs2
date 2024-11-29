import { isUkefEmail } from './is-ukef-email';

describe('isUkefEmail', () => {
  const invalidEmails = [
    '',
    ' ',
    'test',
    'test@',
    'test@example.com',
    'test@gov.uk',
    'maker1@ukexportfinance.com',
    'maker1@ukexportfinance.co.uk',
    'admin@ukexportfinance.com',
    'admin@ukexportfinance.co.uk',
    'maker1@ukef.co.uk',
  ];
  const validEmails = [
    'maker1@ukexportfinance.gov.uk',
    'first.last@ukexportfinance.gov.uk',
    'ukexportfinance@ukexportfinance.gov.uk',
    ' ukexportfinance@ukexportfinance.gov.uk ',
    'ukexportfinance@ukexportfinance.gov.uk ',
  ];

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
