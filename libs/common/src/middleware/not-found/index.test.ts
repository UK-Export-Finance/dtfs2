import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { notFound } from './index';

describe('notFound', () => {
  const nextSpy = jest.fn();
  const { req, res } = httpMocks.createMocks({ url: '/invalid' });

  console.info = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render specified path with no options', () => {
    // Arrange
    const mockPath = 'partials/not_found.njk';
    const middleware = notFound(mockPath);

    // Act
    middleware(req, res, nextSpy);

    // Assert
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith('Requested URL %s does not exist.', '/invalid');

    expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
    expect(res._getRenderView()).toBe(mockPath);
    expect(res._getRenderData()).toBeUndefined();

    expect(nextSpy).toHaveBeenCalledTimes(1);
  });

  it('should render specified path with options', () => {
    // Arrange
    const mockPath = 'partials/not_found.njk';
    const mockOptions = {
      user: {
        name: 'A',
      },
    };
    const middleware = notFound(mockPath, mockOptions);

    // Act
    middleware(req, res, nextSpy);

    // Assert
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith('Requested URL %s does not exist.', '/invalid');

    expect(res._getStatusCode()).toBe(HttpStatusCode.NotFound);
    expect(res._getRenderView()).toBe(mockPath);
    expect(res._getRenderData()).toBe(mockOptions);

    expect(nextSpy).toHaveBeenCalledTimes(1);
  });
});
