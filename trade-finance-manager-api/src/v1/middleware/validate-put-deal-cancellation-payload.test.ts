import { TfmDealCancellation } from '@ukef/dtfs2-common';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { validatePutDealCancellationPayload } from './validate-put-deal-cancellation-payload';

describe('validatePostPaymentPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidPayload = (): Partial<TfmDealCancellation> => ({
    reason: 'x'.repeat(1200),
    bankRequestDate: new Date().valueOf(),
    effectiveFrom: new Date().valueOf(),
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'payload' is undefined`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = undefined;

    // Act
    validatePutDealCancellationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'reason' is not a string`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      reason: 1234,
    };
    req.body = invalidPayload;

    // Act
    validatePutDealCancellationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'reason' is over 1200 characters`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      reason: 'x'.repeat(1201),
    };
    req.body = invalidPayload;

    // Act
    validatePutDealCancellationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'effectiveFrom' is a string`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      effectiveFrom: new Date().toString(),
    };
    req.body = invalidPayload;

    // Act
    validatePutDealCancellationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'bankRequestDate' is a string`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      bankRequestDate: new Date().toString(),
    };
    req.body = invalidPayload;

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
