import { InvalidDealIdError } from './invalid-deal-id.error';

describe('InvalidDealIdError', () => {
  const dealId = 'Example deal id';

  it('exposes the message the error was created with', () => {
    // Act
    const exception = new InvalidDealIdError(dealId);

    // Assert
    expect(exception.message).toEqual('Invalid deal ID: Example deal id');
  });

  it('has the message "Invalid deal ID" if no dealId is provided', () => {
    // Act
    const exception = new InvalidDealIdError();

    // Assert
    expect(exception.message).toEqual('Invalid deal ID');
  });

  it('is an instance of InvalidDealIdError', () => {
    // Act
    const exception = new InvalidDealIdError(dealId);

    // Assert
    expect(exception).toBeInstanceOf(InvalidDealIdError);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new InvalidDealIdError(dealId);

    // Assert
    expect(exception.name).toEqual('InvalidDealIdError');
  });
});
