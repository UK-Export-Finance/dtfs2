import { ApiError } from './api.error';
import { EligibilityCriteriaNotFoundError } from './eligibility-criteria-not-found.error';

describe('EligibilityCriteriaNotFoundError', () => {
  it('should expose the message the error was created with', () => {
    // Act
    const exception = new EligibilityCriteriaNotFoundError();

    // Assert
    expect(exception.message).toEqual('Latest eligibility criteria not found');
  });

  it('should be an instance of EligibilityCriteriaNotFoundError', () => {
    // Act
    const exception = new EligibilityCriteriaNotFoundError();

    // Assert
    expect(exception).toBeInstanceOf(EligibilityCriteriaNotFoundError);
  });

  it('should be an instance of ApiError', () => {
    // Act
    const exception = new EligibilityCriteriaNotFoundError();

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('should expose the name of the exception', () => {
    // Act
    const exception = new EligibilityCriteriaNotFoundError();

    // Assert
    expect(exception.name).toEqual('EligibilityCriteriaNotFoundError');
  });
});
