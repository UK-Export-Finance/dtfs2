import { ACCESS_CODE, AccessCode } from '@ukef/dtfs2-common';
import { getNextAccessCodePage } from './get-next-access-code-page';
import { LANDING_PAGES } from '../../constants/landing-pages';

describe('getNextAccessCodePage', () => {
  it(`should return correct access code page when attemptLefts is 3`, () => {
    // Act
    const result = getNextAccessCodePage(3);

    // Assert
    expect(result).toEqual({
      requestNewCodeUrl: `/login/${ACCESS_CODE.CHECK_YOUR_EMAIL}`,
    });
  });

  it(`should return correct access code page when attemptLefts is 2`, () => {
    // Act
    const result = getNextAccessCodePage(2);

    // Assert
    expect(result).toEqual({
      requestNewCodeUrl: `/login/${ACCESS_CODE.NEW_ACCESS_CODE}`,
    });
  });

  it(`should return correct access code page when attemptLefts is 1`, () => {
    // Act
    const result = getNextAccessCodePage(1);

    // Assert
    expect(result).toEqual({
      requestNewCodeUrl: `/login/${ACCESS_CODE.ANOTHER_ACCESS_CODE}`,
    });
  });

  it(`should return correct access code page when attemptLefts is 0`, () => {
    // Act
    const result = getNextAccessCodePage(0);

    // Assert
    expect(result).toEqual({
      requestNewCodeUrl: `/login/${ACCESS_CODE.SUSPENDED_ACCOUNT}`,
    });
  });

  it('should return login page when attemptLefts is invalid', () => {
    // Arrange
    const attemptLefts = 'invalid-page' as AccessCode;

    // Act
    const result = getNextAccessCodePage(attemptLefts as unknown as number);

    // Assert
    expect(result).toEqual({
      requestNewCodeUrl: LANDING_PAGES.LOGIN,
    });
  });
});
