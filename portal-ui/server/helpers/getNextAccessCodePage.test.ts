import { ACCESS_CODE_PAGES, AccessCode } from '@ukef/dtfs2-common';
import { getNextAccessCodePage } from './getNextAccessCodePage';
import { LANDING_PAGES } from '../constants/landing-pages';

describe('getNextAccessCodePage', () => {
  it(`should return correct access code page when attemptsLeft is 2`, () => {
    // Act
    const result = getNextAccessCodePage(2);

    // Assert
    expect(result).toEqual(`/login/${ACCESS_CODE_PAGES.CHECK_YOUR_EMAIL}`);
  });

  it(`should return correct access code page when attemptsLeft is 1`, () => {
    // Act
    const result = getNextAccessCodePage(1);

    // Assert
    expect(result).toEqual(`/login/${ACCESS_CODE_PAGES.NEW_ACCESS_CODE}`);
  });

  it(`should return correct access code page when attemptsLeft is 0`, () => {
    // Act
    const result = getNextAccessCodePage(0);

    // Assert
    expect(result).toEqual(`/login/${ACCESS_CODE_PAGES.ANOTHER_ACCESS_CODE}`);
  });

  it(`should return correct access code page when attemptsLeft is -1`, () => {
    // Act
    const result = getNextAccessCodePage(-1);

    // Assert
    expect(result).toEqual(`/login/${ACCESS_CODE_PAGES.SUSPENDED_ACCOUNT}`);
  });

  it('should return login page when attemptsLeft is invalid', () => {
    // Arrange
    const attemptsLeft = 'invalid-page' as AccessCode;

    // Act
    const result = getNextAccessCodePage(attemptsLeft as unknown as number);

    // Assert
    expect(result).toEqual(LANDING_PAGES.LOGIN);
  });
});
