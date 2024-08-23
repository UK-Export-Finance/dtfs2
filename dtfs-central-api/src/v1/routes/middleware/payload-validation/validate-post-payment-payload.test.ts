import { CURRENCY } from '@ukef/dtfs2-common';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PostPaymentPayload, validatePostPaymentPayload } from './validate-post-payment-payload';
import { aTfmSessionUser } from '../../../../../test-helpers';

describe('validatePostPaymentPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const requiredPayloadKeys: (keyof PostPaymentPayload)[] = ['feeRecordIds', 'paymentCurrency', 'paymentAmount', 'datePaymentReceived', 'user'];

  const aValidPayload = (): PostPaymentPayload => ({
    feeRecordIds: [1],
    paymentCurrency: 'GBP',
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
    validatePostPaymentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'feeRecordIds' list is empty`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      feeRecordIds: [],
    };
    req.body = invalidPayload;

    // Act
    validatePostPaymentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if one of the 'feeRecordIds' items is less than one`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      feeRecordIds: [1, 2, -1],
    };
    req.body = invalidPayload;

    // Act
    validatePostPaymentPayload(req, res, next);

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
    validatePostPaymentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it.each(Object.values(CURRENCY))("calls the 'next' function when the 'paymentCurrency' is '%s'", (currency) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const validPayload = {
      ...aValidPayload(),
      paymentCurrency: currency,
    };
    req.body = validPayload;

    // Act
    validatePostPaymentPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toBe(false);
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
    validatePostPaymentPayload(req, res, next);
    const { datePaymentReceived } = req.body as PostPaymentPayload;

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
    validatePostPaymentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls the 'next' function if the 'paymentReference' is undefined", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const validPayload = {
      ...aValidPayload(),
      paymentReference: undefined,
    };
    req.body = validPayload;

    // Act
    validatePostPaymentPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toBe(false);
  });
});
