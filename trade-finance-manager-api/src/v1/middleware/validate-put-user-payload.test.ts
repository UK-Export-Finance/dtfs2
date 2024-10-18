import { getUserUpsertRequestFailureTestCases, getUserUpsertRequestSuccessTestCases } from '@ukef/dtfs2-common';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { validatePutUserPayload } from './validate-put-user-payload';

describe('validatePutUserPayload', () => {
  it.each(
    getUserUpsertRequestFailureTestCases({
      getTestObjectWithUpdatedUserUpsertRequestParams: aPayloadWithUpdatedUserUpsertRequest,
    }),
  )(`responds with a '${HttpStatusCode.BadRequest}' if $description`, ({ aTestCase }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = aTestCase();

    // Act
    validatePutUserPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it.each(
    getUserUpsertRequestSuccessTestCases({
      getTestObjectWithUpdatedUserUpsertRequestParams: aPayloadWithUpdatedUserUpsertRequest,
    }),
  )("calls the 'next' function if the payload is valid", ({ aTestCase }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = aTestCase();

    // Act
    validatePutUserPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });

  function aPayloadWithUpdatedUserUpsertRequest(userUpsertRequest: unknown) {
    return userUpsertRequest;
  }

  function getHttpMocks() {
    return httpMocks.createMocks();
  }
});
