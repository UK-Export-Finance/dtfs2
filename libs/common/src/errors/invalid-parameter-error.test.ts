import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';
import { InvalidParameterError } from './invalid-parameter-error';

describe('InvalidParameterError', () => {
  it('exposes the message the error was created with if the parameterValue is a string', () => {
    // Arrange
    const parameterName = 'parameterName';
    const parameterValue = 'parameterValue';

    // Act
    const exception = new InvalidParameterError(parameterName, parameterValue);

    // Assert
    expect(exception.message).toEqual('Invalid parameterName: "parameterValue"');
  });

  it('exposes the message the error was created with if the parameterValue is a number', () => {
    // Arrange
    const parameterName = 'parameterName';
    const parameterValue = 123;

    // Act
    const exception = new InvalidParameterError(parameterName, parameterValue);

    // Assert
    expect(exception.message).toEqual('Invalid parameterName: 123');
  });

  it('exposes the message the error was created with if the parameterValue is an object', () => {
    // Arrange
    const parameterName = 'parameterName';
    const parameterValue = { property: 13 };

    // Act
    const exception = new InvalidParameterError(parameterName, parameterValue);

    // Assert
    expect(exception.message).toEqual('Invalid parameterName: {"property":13}');
  });

  it('exposes the message the error was created with if the parameterValue is an array', () => {
    // Arrange
    const parameterName = 'parameterName';
    const parameterValue = [1, 3, 'test'];

    // Act
    const exception = new InvalidParameterError(parameterName, parameterValue);

    // Assert
    expect(exception.message).toEqual('Invalid parameterName: [1,3,"test"]');
  });

  it('exposes the message the error was created with if the parameterValue is a boolean', () => {
    // Arrange
    const parameterName = 'parameterName';
    const parameterValue = false;

    // Act
    const exception = new InvalidParameterError(parameterName, parameterValue);

    // Assert
    expect(exception.message).toEqual('Invalid parameterName: false');
  });

  it('exposes the 400 (Bad Request) status code', () => {
    // Arrange
    const parameterName = 'parameterName';
    const parameterValue = 'parameterValue';

    // Act
    const error = new InvalidParameterError(parameterName, parameterValue);

    // Assert
    expect(error.status).toEqual(HttpStatusCode.BadRequest);
  });

  it('exposes the name of the exception', () => {
    // Arrange
    const parameterName = 'parameterName';
    const parameterValue = 'parameterValue';

    // Act
    const exception = new InvalidParameterError(parameterName, parameterValue);

    // Assert
    expect(exception.name).toEqual('InvalidParameterError');
  });

  it('is an instance of an ApiError', () => {
    // Arrange
    const parameterName = 'parameterName';
    const parameterValue = 'parameterValue';

    // Act
    const exception = new InvalidParameterError(parameterName, parameterValue);

    // Assert
    expect(exception).toBeInstanceOf(ApiError);
  });

  it('is an instance of InvalidParameterError', () => {
    // Arrange
    const parameterName = 'parameterName';
    const parameterValue = 'parameterValue';

    // Act
    const exception = new InvalidParameterError(parameterName, parameterValue);

    // Assert
    expect(exception).toBeInstanceOf(InvalidParameterError);
  });
});
