import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PatchPaymentPayload, validatePatchPaymentPayload } from './validate-patch-payment-payload';
import { aTfmSessionUser } from '../../../../../test-helpers';

describe('validatePatchPaymentPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const requiredPayloadKeys: (keyof PatchPaymentPayload)[] = ['paymentAmount', 'datePaymentReceived', 'paymentReference', 'user'];

  const aValidPayload = (): PatchPaymentPayload => ({
    paymentAmount: 100,
    datePaymentReceived: new Date(),
    paymentReference: 'a payment reference',
    user: aTfmSessionUser(),
  });

  it.each(requiredPayloadKeys)(`responds with a '${HttpStatusCode.BadRequest}' if the '%s' field is missing`, (payloadKey) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      [payloadKey]: undefined,
    };
    req.body = invalidPayload;

    // Act
    validatePatchPaymentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'paymentAmount' is less than 0`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      paymentAmount: -1,
    };
    req.body = invalidPayload;

    // Act
    validatePatchPaymentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("coerces the 'datePaymentReceived' field to a date if it is a valid date string and calls the next function", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const dateAsString = '2024-01-01T12:00:00.000Z';

    const validPayload = {
      ...aValidPayload(),
      datePaymentReceived: dateAsString,
    };
    req.body = validPayload;

    // Act
    validatePatchPaymentPayload(req, res, next);
    const { datePaymentReceived } = req.body as PatchPaymentPayload;

    // Assert
    expect(datePaymentReceived).toEqual(new Date(dateAsString));
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toBe(false);
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'datePaymentReceived' field is an invalid date string`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      datePaymentReceived: 'invalid-date',
    };
    req.body = invalidPayload;

    // Act
    validatePatchPaymentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls the 'next' function if the 'paymentReference' is null and sets the request body 'paymentReference' to undefined", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const validPayload = {
      ...aValidPayload(),
      paymentReference: null,
    };
    req.body = validPayload;

    // Act
    validatePatchPaymentPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toBe(false);

    const requestBody = req.body as PatchPaymentPayload;
    expect('paymentReference' in requestBody).toBe(true);
    expect(requestBody.paymentReference).toBeUndefined();
  });

  it("calls the 'next' function if the 'paymentReference' is a string and does not change the request body 'paymentReference' value", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const validPayload = {
      ...aValidPayload(),
      paymentReference: 'Some payment reference',
    };
    req.body = validPayload;

    // Act
    validatePatchPaymentPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toBe(false);

    const requestBody = req.body as PatchPaymentPayload;
    expect(requestBody.paymentReference).toBe('Some payment reference');
  });
});
