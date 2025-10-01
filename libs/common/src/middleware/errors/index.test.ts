import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { errors } from './index';

describe('errors', () => {
  const nextSpy = jest.fn();
  const { req, res } = httpMocks.createMocks({ url: '/valid' });

  console.error = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render specified path with no options', () => {
    // Arrange
    const mockPath = 'partials/problem_with_service_page.njk';
    const mockError = new Error('Invalid CSRF');
    const middleware = errors(mockPath);

    // Act
    middleware(mockError, req, res, nextSpy);

    // Assert
    expect(nextSpy).toHaveBeenCalledTimes(1);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('❌ An error has occurred for the requested URI `%s` %o', '/valid', new Error('Invalid CSRF'));

    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._getRenderView()).toBe(mockPath);
    expect(res._getRenderData()).toBeUndefined();
  });

  it('should render specified path with no options', () => {
    // Arrange
    const mockPath = 'partials/problem_with_service_page.njk';
    const mockOptions = {
      user: {
        name: 'A',
      },
    };
    const mockError = new Error('Invalid CSRF');
    const middleware = errors(mockPath, mockOptions);

    // Act
    middleware(mockError, req, res, nextSpy);

    // Assert
    expect(nextSpy).toHaveBeenCalledTimes(1);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('❌ An error has occurred for the requested URI `%s` %o', '/valid', new Error('Invalid CSRF'));

    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._getRenderView()).toBe(mockPath);
    expect(res._getRenderData()).toBe(mockOptions);
  });
});
