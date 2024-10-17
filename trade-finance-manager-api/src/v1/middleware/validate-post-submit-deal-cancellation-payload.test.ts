import { MAX_CHARACTER_COUNT, TfmDealCancellationWithoutStatus } from '@ukef/dtfs2-common';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { validatePostSubmitDealCancellationPayload } from './validate-post-submit-deal-cancellation-payload';

describe('validatePostSubmitDealCancellationPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidPayload = (): TfmDealCancellationWithoutStatus => ({
    reason: 'x'.repeat(MAX_CHARACTER_COUNT),
    bankRequestDate: new Date().valueOf(),
    effectiveFrom: new Date().valueOf(),
  });

  const invalidPayloads = [
    {
      description: 'the payload is undefined',
      payload: undefined,
    },
    {
      description: "the 'reason' is not a string",
      payload: {
        ...aValidPayload(),
        reason: 1234,
      },
    },
    {
      description: `the 'reason' is over ${MAX_CHARACTER_COUNT} characters`,
      payload: {
        ...aValidPayload(),
        reason: 'x'.repeat(MAX_CHARACTER_COUNT + 1),
      },
    },
    {
      description: "the 'reason' is undefined",
      payload: {
        ...aValidPayload(),
        reason: undefined,
      },
    },
    {
      description: "the 'effectiveFrom' is a string",
      payload: {
        ...aValidPayload(),
        effectiveFrom: new Date().toString(),
      },
    },
    {
      description: "the 'effectiveFrom' is undefined",
      payload: {
        ...aValidPayload(),
        effectiveFrom: undefined,
      },
    },
    {
      description: "the 'bankRequestDate' is a string",
      payload: {
        ...aValidPayload(),
        bankRequestDate: new Date().toString(),
      },
    },
    {
      description: "the 'bankRequestDate' is undefined",
      payload: {
        ...aValidPayload(),
        bankRequestDate: undefined,
      },
    },
  ];

  it.each(invalidPayloads)(`responds with a '${HttpStatusCode.BadRequest}' if $description`, ({ payload }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = payload;

    // Act
    validatePostSubmitDealCancellationPayload(req, res, next);

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
    validatePostSubmitDealCancellationPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
