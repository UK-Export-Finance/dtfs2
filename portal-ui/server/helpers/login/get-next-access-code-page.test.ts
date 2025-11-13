import { ATTEMPTS_LEFT, ACCESS_CODE, AccessCode } from '@ukef/dtfs2-common';
import { getNextAccessCodePage } from './get-next-access-code-page';

describe('getNextAccessCodePage', () => {
  it(`should return correct data for ${ACCESS_CODE.CHECK_YOUR_EMAIL}`, () => {
    // Act
    const result = getNextAccessCodePage(ACCESS_CODE.CHECK_YOUR_EMAIL);

    // Assert
    expect(result).toEqual({
      requestNewCodeUrl: `/login/access-code/${ACCESS_CODE.CHECK_YOUR_EMAIL}`,
      attemptsLeft: ATTEMPTS_LEFT.THREE,
    });
  });

  it(`should return correct data for ${ACCESS_CODE.NEW_ACCESS_CODE}`, () => {
    // Act
    const result = getNextAccessCodePage(ACCESS_CODE.NEW_ACCESS_CODE);

    // Assert
    expect(result).toEqual({
      requestNewCodeUrl: `/login/access-code/${ACCESS_CODE.NEW_ACCESS_CODE}`,
      attemptsLeft: ATTEMPTS_LEFT.TWO,
    });
  });

  it(`should return correct data for ${ACCESS_CODE.ANOTHER_ACCESS_CODE}`, () => {
    // Act
    const result = getNextAccessCodePage(ACCESS_CODE.ANOTHER_ACCESS_CODE);

    // Assert
    expect(result).toEqual({
      requestNewCodeUrl: `/login/access-code/${ACCESS_CODE.ANOTHER_ACCESS_CODE}`,
      attemptsLeft: ATTEMPTS_LEFT.ONE,
    });
  });

  it(`should return correct data for ${ACCESS_CODE.SUSPENDED_ACCOUNT}`, () => {
    // Act
    const result = getNextAccessCodePage(ACCESS_CODE.SUSPENDED_ACCOUNT);

    // Assert
    expect(result).toEqual({
      requestNewCodeUrl: `/login/access-code/${ACCESS_CODE.SUSPENDED_ACCOUNT}`,
      attemptsLeft: ATTEMPTS_LEFT.ZERO,
    });
  });

  it('should return error for unknown page', () => {
    // Arrange
    const page = 'invalid-page' as AccessCode;

    // Act
    const result = getNextAccessCodePage(page);

    // Assert
    expect(result).toEqual({ error: true });
  });
});
