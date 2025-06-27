import { PORTAL_AMENDMENT_STATUS } from '../constants';
import { ApiError } from './api.error';
import { InvalidAmendmentStatusError } from './invalid-amendment-status.error';

describe('InvalidAmendmentStatusError', () => {
  const status = PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL;

  it('should expose the message the error was created with', () => {
    // Act
    const exception = new InvalidAmendmentStatusError(status);

    // Assert
    expect(exception.message).toEqual(`Invalid portal amendment status: ${status}`);
  });

  it('should has the message "Invalid portal amendment status" if no status is provided', () => {
    // Act
    const exception = new InvalidAmendmentStatusError();

    // Assert
    expect(exception.message).toEqual('Invalid portal amendment status');
  });

  it('should be an instance of InvalidAmendmentStatusError', () => {
    // Act
    const exception = new InvalidAmendmentStatusError(status);

    // Assert
    expect(exception).toBeInstanceOf(InvalidAmendmentStatusError);
  });

  it('should be an instance of ApiError', () => {
    // Act
    const exception = new InvalidAmendmentStatusError(status);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('should expose the name of the exception', () => {
    // Act
    const exception = new InvalidAmendmentStatusError(status);

    // Assert
    expect(exception.name).toEqual('InvalidAmendmentStatusError');
  });
});
