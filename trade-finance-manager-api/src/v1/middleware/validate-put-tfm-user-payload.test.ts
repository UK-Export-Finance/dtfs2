import { aUpsertTfmUserRequest } from '@ukef/dtfs2-common';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { validateTfmPutUserPayload } from './validate-put-tfm-user-payload';

describe('validatePutTfmUserPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidPayload = aUpsertTfmUserRequest;

  const invalidPayloads = [
    {
      description: 'the payload is undefined',
      payload: undefined,
    },
    {
      description: 'the payload is not valid',
      payload: {
        // Missing last name field
        azureOid: 'an-azure-oid',
        email: 'an-email',
        username: 'a-username',
        teams: ['BUSINESS_SUPPORT'],
        timezone: 'Europe/London',
        firstName: 'a-first-name',
      },
    },
    {
      description: 'the payload is an empty object',
      payload: {},
    },
  ];

  it.each(invalidPayloads)(`responds with a '${HttpStatusCode.BadRequest}' if $description`, ({ payload }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = payload;

    // Act
    validateTfmPutUserPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls the 'next' function if the payload is valid", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = aValidPayload();

    // Act
    validateTfmPutUserPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
