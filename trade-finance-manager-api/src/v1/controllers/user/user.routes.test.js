const httpMocks = require('node-mocks-http');
const { aValidEntraIdUser, ApiError } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const { upsertTfmUserFromEntraIdUser } = require('./user.routes');
const userController = require('./user.controller');

jest.mock('../user/user.controller.js', () => ({
  upsertTfmUserFromEntraIdUser: jest.fn(),
}));

describe('user routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('upsertTfmUserFromEntraIdUser', () => {
    describe('when the request body is invalid', () => {
      let invalidRequest;

      beforeEach(() => {
        const { oid, ...rest } = aValidEntraIdUser();
        invalidRequest = rest;
      });

      it('returns a bad request', async () => {
        const { req, res, next } = getHttpMocks(invalidRequest);
        const expectedErrorResponse = { message: 'Error validating payload', status: 400 };
        await upsertTfmUserFromEntraIdUser(req, res, next);

        expect(res._getData()).toEqual(expectedErrorResponse);
        expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      });
    });

    describe('when the request body is valid', () => {
      let validRequest;

      beforeEach(() => {
        validRequest = aValidEntraIdUser();
      });

      it('calls the user controller', async () => {
        const { req, res, next } = getHttpMocks(validRequest);

        await upsertTfmUserFromEntraIdUser(req, res, next);

        expect(jest.mocked(userController.upsertTfmUserFromEntraIdUser)).toHaveBeenCalledTimes(1);
      });

      describe('when the upsert is unsuccessful', () => {
        describe('when the error is an api error', () => {
          const apiErrorDetails = {
            status: 500,
            message: 'an api error message',
            cause: 'a cause that should not be exposed',
            code: 'a code',
          };

          beforeEach(() => {
            jest.mocked(userController.upsertTfmUserFromEntraIdUser).mockRejectedValueOnce(new ApiError(apiErrorDetails));
          });

          it('returns the api error with expected formatting', async () => {
            const { req, res, next } = getHttpMocks(validRequest);
            const { cause, ...expectedErrorDetails } = apiErrorDetails;
            await upsertTfmUserFromEntraIdUser(req, res, next);

            expect(res._getData()).toEqual(expectedErrorDetails);
            expect(res._getStatusCode()).toEqual(expectedErrorDetails.status);
          });
        });

        describe('when the error is not an api error', () => {
          const errorToThrow = new Error('An Error');
          beforeEach(() => {
            jest.mocked(userController.upsertTfmUserFromEntraIdUser).mockRejectedValueOnce(errorToThrow);
          });

          it('passes the error to further middleware', async () => {
            const { req, res, next } = getHttpMocks(validRequest);

            await upsertTfmUserFromEntraIdUser(req, res, next);

            expect(next).toHaveBeenCalledWith(errorToThrow);
          });
        });
      });

      describe('when the upsert is successful', () => {
        const aSuccessfulResponseFromController = 'aSuccessfulResponse';

        beforeEach(() => {
          jest.mocked(userController.upsertTfmUserFromEntraIdUser).mockResolvedValueOnce(aSuccessfulResponseFromController);
        });

        it('returns the result of the user controller', async () => {
          const { req, res, next } = getHttpMocks(validRequest);

          await upsertTfmUserFromEntraIdUser(req, res, next);

          expect(res._getData()).toEqual(aSuccessfulResponseFromController);
        });
      });
    });

    function getHttpMocks(body) {
      const { req, res } = httpMocks.createMocks({
        body,
      });
      const next = jest.fn();
      return { req, res, next };
    }
  });
});
