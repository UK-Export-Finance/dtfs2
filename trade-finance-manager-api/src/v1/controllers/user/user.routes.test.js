const httpMocks = require('node-mocks-http');
const { anEntraIdUser, ApiError, TEAMS } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
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
      givenTheRequestWouldOtherwiseSucceed: mockSuccessfulUpsertTfmUserFromEntraIdUser,
      successTestCases: getEntraIdUserSuccessTestCases({}),
      successStatusCode: HttpStatusCode.Ok,
      successResponse: aSuccessfulResponseFromController,
      failureTestCases: getEntraIdUserFailureTestCases({}),
      failureResponse: {
        status: HttpStatusCode.BadRequest,
        message: 'Error validating payload',
      },
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

function getEntraIdUserFailureTestCases({ getTestObjectWithUpdatedEntraIdUserParams = (entraIdUser) => entraIdUser }) {
  return [
    {
      aTestCase: () => {
        const { oid: _oid, ...rest } = anEntraIdUser();
        return getTestObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the oid is missing',
    },
    {
      aTestCase: () => {
        const { verified_primary_email: _verifiedPrimaryEmail, ...rest } = anEntraIdUser();
        return getTestObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the verified primary email is missing',
    },
    {
      aTestCase: () => {
        const { verified_secondary_email: _verifiedSecondaryEmail, ...rest } = anEntraIdUser();
        return getTestObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the verified secondary email is missing',
    },
    {
      aTestCase: () => {
        const { given_name: _givenName, ...rest } = anEntraIdUser();
        return getTestObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the given name is missing',
    },

    {
      aTestCase: () => {
        const { family_name: _familyName, ...rest } = anEntraIdUser();
        return getTestObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the family name is missing',
    },
    {
      aTestCase: () => {
        const { roles: _roles, ...rest } = anEntraIdUser();
        return getTestObjectWithUpdatedEntraIdUserParams(rest);
      },
      description: 'the roles are missing',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), oid: 1 }),
      description: 'the oid is not a string',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), verified_primary_email: [] }),
      description: 'the verify primary email array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), verified_primary_email: [1] }),
      description: 'the verify primary email is not a string array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), verified_primary_email: '1' }),
      description: 'the verify primary email is not an array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), verified_secondary_email: [1] }),
      description: 'the verify secondary email is not a string array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), verified_secondary_email: '1' }),
      description: 'the verify secondary email is not an array',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), given_name: 1 }),
      description: 'the given name is not a string',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), family_name: 1 }),
      description: 'the family name is not a string',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), roles: ['NOT_A_USER_ROLE'] }),
      description: 'the roles are not an array of user roles',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), roles: TEAMS.BUSINESS_SUPPORT.id }),
      description: 'the roles are not an array',
    },
    {
      aTestCase: () => ({}),
      description: 'the object is empty',
    },
  ];
}

function getEntraIdUserSuccessTestCases({ getTestObjectWithUpdatedEntraIdUserParams = (entraIdUser) => entraIdUser }) {
  return [
    { aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams(anEntraIdUser()), description: 'a complete valid payload is present' },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), verified_secondary_email: [] }),
      description: 'the verified secondary email array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), roles: [] }),
      description: 'the roles array is empty',
    },
    {
      aTestCase: () => getTestObjectWithUpdatedEntraIdUserParams({ ...anEntraIdUser(), extraField: 'extra' }),
      description: 'there is an extra field',
    },
  ];
}
