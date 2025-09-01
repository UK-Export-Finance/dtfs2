import { HttpStatusCode } from 'axios';
import httpMocks from 'node-mocks-http';
import { maintenance } from '.';

const falsyModeValues = ['', 'undefined', 'null', 'false', '0'];
const truthyModeValues = ['true', ' true ', '1'];

describe('middleware/maintenance', () => {
  const { req, res } = httpMocks.createMocks();
  const nextSpy = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it.each(falsyModeValues)('should call next when the maintenance mode is not active, with environment valute set as `%s`', (value) => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = value;

    // Act
    maintenance(req, res, nextSpy);

    // Assert
    expect(nextSpy).toHaveBeenCalledTimes(1);
    expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
  });

  it.each(truthyModeValues)(
    `should return ${HttpStatusCode.ServiceUnavailable} when the maintenance mode is active, with environment valute set as '%s'`,
    (value) => {
      // Arrange
      process.env.MAINTENANCE_ACTIVE = value;

      // Act
      maintenance(req, res, nextSpy);

      // Assert
      expect(nextSpy).not.toHaveBeenCalled();

      expect(res._getHeaders()).toEqual({
        'retry-after': '3600',
        'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'x-ukef-maintenance-active': 'true',
      });
      expect(res._getData()).toEqual({ message: `The service is currently under maintenance. Please try again after 3600 seconds.` });
      expect(res._getStatusCode()).toBe(HttpStatusCode.ServiceUnavailable);
    },
  );
});
