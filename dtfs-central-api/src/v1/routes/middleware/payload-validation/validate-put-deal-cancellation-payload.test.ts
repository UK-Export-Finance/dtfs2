import { AuditDetails, MAX_CHARACTER_COUNT, TfmDealCancellation } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { validatePutDealCancellationPayload } from './validate-put-deal-cancellation-payload';

describe('validatePostPaymentPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidPayload = (): { dealCancellationUpdate: TfmDealCancellation; auditDetails: AuditDetails } => ({
    dealCancellationUpdate: {
      reason: 'x'.repeat(MAX_CHARACTER_COUNT),
      bankRequestDate: new Date().valueOf(),
      effectiveFrom: new Date().valueOf(),
    },
    auditDetails: generateTfmAuditDetails(aTfmSessionUser()._id),
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'dealCancellationUpdate' object is undefined`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      dealCancellationUpdate: undefined,
    };
    req.body = invalidPayload;

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
      dealCancellationUpdate: {
        reason: 1234,
      },
    };
    req.body = invalidPayload;

    // Act
    validatePutDealCancellationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'reason' is over ${MAX_CHARACTER_COUNT} characters`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      dealCancellationUpdate: {
        reason: 'x'.repeat(MAX_CHARACTER_COUNT + 1),
      },
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
      dealCancellationUpdate: {
        effectiveFrom: new Date().toString(),
      },
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
      dealCancellationUpdate: {
        bankRequestDate: new Date().toString(),
      },
    };
    req.body = invalidPayload;

    // Act
    validatePutDealCancellationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'auditDetails' is undefined`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      auditDetails: undefined,
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
