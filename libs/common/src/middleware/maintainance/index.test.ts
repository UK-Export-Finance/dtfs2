import { HttpStatusCode } from 'axios';
import httpMocks from 'node-mocks-http';
import { maintenance } from '.';

const falsyModeValues = ['', 'undefined', 'null', 'false', '0'];
const truthyModeValues = ['true', ' true ', '1'];

describe('middleware/maintenance', () => {
  describe('API', () => {
    const { req, res } = httpMocks.createMocks({
      headers: {
        accept: 'application/json',
      },
    });
    const nextSpy = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it.each(falsyModeValues)('should call next when the maintenance mode is not active, with environment value set as `%s`', (value) => {
      // Arrange
      process.env.MAINTENANCE_ACTIVE = value;

      // Act
      maintenance(req, res, nextSpy);

      // Assert
      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    });

    it.each(truthyModeValues)(
      `should return ${HttpStatusCode.ServiceUnavailable} when the maintenance mode is active, with environment value set as '%s'`,
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
        expect(res._getStatusCode()).toBe(HttpStatusCode.ServiceUnavailable);

        expect(res._getData()).toEqual({ message: `The service is currently under maintenance. Please try again after 3600 seconds.` });

        expect(res._getRenderView()).toBe('');
        expect(res._getRenderData()).toEqual({});
      },
    );
  });

  describe('UI', () => {
    const { req, res } = httpMocks.createMocks({
      headers: {
        accept: 'text/html',
      },
    });
    const nextSpy = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it.each(falsyModeValues)('should call next when the maintenance mode is not active, with environment value set as `%s`', (value) => {
      // Arrange
      process.env.MAINTENANCE_ACTIVE = value;

      // Act
      maintenance(req, res, nextSpy);

      // Assert
      expect(nextSpy).toHaveBeenCalledTimes(1);
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
    });

    it.each(truthyModeValues)(
      `should return ${HttpStatusCode.ServiceUnavailable} and render the template when the maintenance mode is active, with environment value set as '%s'`,
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
        expect(res._getStatusCode()).toBe(HttpStatusCode.ServiceUnavailable);

        expect(res._getData()).toEqual('');

        expect(res._getRenderView()).toBe('maintenance.njk');
        expect(res._getRenderData()).toEqual({
          message: 'You will be able to use the service from.',
        });
      },
    );
  });
});
