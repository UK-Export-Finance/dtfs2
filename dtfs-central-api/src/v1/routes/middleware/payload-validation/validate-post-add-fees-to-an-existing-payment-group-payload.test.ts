import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import {
  PostAddFeesToAnExistingPaymentGroupPayload,
  validatePostAddFeesToAnExistingPaymentGroupPayload,
} from './validate-post-add-fees-to-an-existing-payment-group-payload';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';

console.error = jest.fn();

describe('validatePostAddFeesToAnExistingPaymentGroupPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const requiredPayloadKeys: (keyof PostAddFeesToAnExistingPaymentGroupPayload)[] = ['feeRecordIds', 'paymentIds', 'user'];

  const aValidPayload = (): PostAddFeesToAnExistingPaymentGroupPayload => ({
    feeRecordIds: [7],
    paymentIds: [77],
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
    validatePostAddFeesToAnExistingPaymentGroupPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['feeRecordIds', 'paymentIds'])(`responds with a '${HttpStatusCode.BadRequest}' if the '%s' list is empty`, (payloadKey) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      [payloadKey]: [],
    };
    req.body = invalidPayload;

    // Act
    validatePostAddFeesToAnExistingPaymentGroupPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['feeRecordIds', 'paymentIds'])(`responds with a '${HttpStatusCode.BadRequest}' if one of the '%s' items is less than one`, (payloadKey) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      [payloadKey]: [7, 8, -1],
    };
    req.body = invalidPayload;

    // Act
    validatePostAddFeesToAnExistingPaymentGroupPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });
});
