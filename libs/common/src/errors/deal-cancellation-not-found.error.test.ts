import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';
import { DealCancellationNotFoundError } from './deal-cancellation-not-found.error';

describe('DealNotFoundError', () => {
  const dealId = 'Example deal id';

  it('exposes the message the error was created with', () => {
    // Act
    const exception = new DealCancellationNotFoundError(dealId);

    // Assert
    expect(exception.message).toEqual('Cancellation not found on Deal: Example deal id');
  });

  it('has the message "Deal Cancellation not found" if no dealId is provided', () => {
    // Act
    const exception = new DealCancellationNotFoundError();

    // Assert
    expect(exception.message).toEqual('Deal Cancellation not found');
  });

  it('has status 404', () => {
    // Act
    const exception = new DealCancellationNotFoundError();

    // Assert
    expect(exception.status).toEqual(HttpStatusCode.NotFound);
  });

  it('is an instance of DealCancellationNotFoundError', () => {
    // Act
    const exception = new DealCancellationNotFoundError(dealId);

    // Assert
    expect(exception).toBeInstanceOf(DealCancellationNotFoundError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new DealCancellationNotFoundError(dealId);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new DealCancellationNotFoundError(dealId);

    // Assert
    expect(exception.name).toEqual('DealCancellationNotFoundError');
  });
});
