import { RestError } from '@azure/storage-file-share';
import { AZURE_STORAGE_SHARE_ERROR_CODE, isParentNotFoundError } from './error-helper';

describe('error-helper', () => {
  it('returns false when not a RestError', () => {
    // Arrange
    const error = new Error(AZURE_STORAGE_SHARE_ERROR_CODE.PARENT_NOT_FOUND);

    // Act
    const result = isParentNotFoundError(error);

    // Assert
    expect(result).toEqual(false);
  });

  it.each`
    errorCode
    ${undefined}
    ${404}
    ${'AuthorizationFailure'}
  `('returns false when errorCode is $errorCode', ({ errorCode }: { errorCode: unknown }) => {
    // Arrange
    const error = new RestError('Failed to create directory');
    error.details = { errorCode };

    // Act
    const result = isParentNotFoundError(error);

    // Assert
    expect(result).toEqual(false);
  });

  it(`returns true when errorCode is '${AZURE_STORAGE_SHARE_ERROR_CODE.PARENT_NOT_FOUND}'`, () => {
    // Arrange
    const error = new RestError('Failed to create directory');
    error.details = { errorCode: AZURE_STORAGE_SHARE_ERROR_CODE.PARENT_NOT_FOUND };

    // Act
    const result = isParentNotFoundError(error);

    // Assert
    expect(result).toEqual(true);
  });
});
