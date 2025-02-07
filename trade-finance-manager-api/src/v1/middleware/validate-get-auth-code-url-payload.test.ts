import { GetAuthCodeUrlRequest } from '@ukef/dtfs2-common';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { validateGetAuthCodePayloadUrl } from './validate-get-auth-code-url-payload';

/**
 * There is not a need to test the full schema validation here
 * as it has already been tested in the common library.
 */
describe('validateGetAuthCodeUrl', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidPayload = (): GetAuthCodeUrlRequest => ({
    successRedirect: 'http://success-redirect',
  });

  it.each(getInvalidPayloadTestCases())(`responds with a '${HttpStatusCode.BadRequest}' if $description`, ({ payload }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = payload;

    // Act
    validateGetAuthCodePayloadUrl(req, res, next);

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
    validateGetAuthCodePayloadUrl(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });

  function getInvalidPayloadTestCases() {
    return [
      {
        description: 'the payload is undefined',
        payload: undefined,
      },
      {
        description: 'the payload is null',
        payload: null,
      },
      {
        description: 'the payload is an empty object',
        payload: {},
      },
      {
        description: 'success redirect is not a string',
        payload: {
          ...aValidPayload(),
          successRedirect: 1234,
        },
      },
    ];
  }
});
