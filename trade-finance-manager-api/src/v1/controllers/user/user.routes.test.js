const httpMocks = require('node-mocks-http');
const { anEntraIdUser, ApiError } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const { getEntraIdUserSuccessTestCases, getEntraIdUserFailureTestCases } = require('@ukef/dtfs2-common');
const { upsertTfmUserFromEntraIdUser } = require('./user.routes');
const userController = require('./user.controller');
const { withValidatePayloadTests } = require('../../../../test-helpers');

jest.mock('../user/user.controller.js', () => ({
  upsertTfmUserFromEntraIdUser: jest.fn(),
}));

describe('user routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('upsertTfmUserFromEntraIdUser', () => {
    const aSuccessfulResponseFromController = 'aSuccessfulResponse';

    withValidatePayloadTests({
      makeRequest: upsertTfmUserFromEntraIdUser,
      successTestCases: getEntraIdUserSuccessTestCases({}),
      failureTestCases: getEntraIdUserFailureTestCases({}),
      givenTheRequestWouldOtherwiseSucceed: mockSuccessfulUpsertTfmUserFromEntraIdUser,
      successStatusCode: HttpStatusCode.Ok,
    });

    describe('when the request body is valid', () => {
      let validRequest;

      beforeEach(() => {
        validRequest = anEntraIdUser();
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
        beforeEach(() => {
          mockSuccessfulUpsertTfmUserFromEntraIdUser();
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

    function mockSuccessfulUpsertTfmUserFromEntraIdUser() {
      jest.mocked(userController.upsertTfmUserFromEntraIdUser).mockResolvedValueOnce(aSuccessfulResponseFromController);
    }
  });
});
