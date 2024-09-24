import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';
import { DealNotFoundError } from './deal-not-found.error';

describe('DealNotFoundError', () => {
  const dealId = 'Example deal id';

  it('exposes the message the error was created with', () => {
    // Act
    const exception = new DealNotFoundError(dealId);

    // Assert
    expect(exception.message).toEqual('Deal not found: Example deal id');
  });

  it('has the message "Deal not found" if no dealId is provided', () => {
    // Act
    const exception = new DealNotFoundError();

    // Assert
    expect(exception.message).toEqual('Deal not found');
  });

  it('has status 404', () => {
    // Act
    const exception = new DealNotFoundError();

    // Assert
    expect(exception.status).toEqual(HttpStatusCode.NotFound);
  });

  it('is an instance of DealNotFoundError', () => {
    // Act
    const exception = new DealNotFoundError(dealId);

    // Assert
    expect(exception).toBeInstanceOf(DealNotFoundError);
  });

  it('is an instance of ApiError', () => {
    // Act
    const exception = new DealNotFoundError(dealId);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new DealNotFoundError(dealId);

    // Assert
    expect(exception.name).toEqual('DealNotFoundError');
  });
});
