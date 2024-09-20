import { MAX_CHARACTER_COUNT, TfmDealCancellation } from '@ukef/dtfs2-common';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { validatePutDealCancellationPayload } from './validate-put-deal-cancellation-payload';

describe('validatePostPaymentPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidPayload = (): Partial<TfmDealCancellation> => ({
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
      description: "the 'effectiveFrom' is a string",
      payload: {
        ...aValidPayload(),
        effectiveFrom: new Date().toString(),
      },
    },
    {
      description: "the 'bankRequestDate' is a string",
      payload: {
        ...aValidPayload(),
        bankRequestDate: new Date().toString(),
      },
    },
  ];

  it.each(invalidPayloads)(`responds with a '${HttpStatusCode.BadRequest}' if $description`, ({ payload }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = payload;

    // Act
    validatePutDealCancellationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls the 'next' function if the payload is valid", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = aValidPayload();

    // Act
    validatePutDealCancellationPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toBe(false);
  });
});
