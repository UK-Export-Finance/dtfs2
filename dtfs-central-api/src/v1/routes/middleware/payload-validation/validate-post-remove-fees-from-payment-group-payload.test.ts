import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PostRemoveFeesFromPaymentGroupPayload, validatePostRemoveFeesFromPaymentGroupPayload } from './validate-post-remove-fees-from-payment-group-payload';
import { aTfmSessionUser } from '../../../../../test-helpers';

describe('validatePostRemoveFeesFromPaymentGroupPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const requiredPayloadKeys: (keyof PostRemoveFeesFromPaymentGroupPayload)[] = ['selectedFeeRecordIds', 'user'];

  const aValidPayload = (): PostRemoveFeesFromPaymentGroupPayload => ({
    selectedFeeRecordIds: [7],
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
    validatePostRemoveFeesFromPaymentGroupPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the 'selectedFeeRecordIds' list is empty`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      selectedFeeRecordIds: [],
    };
    req.body = invalidPayload;

    // Act
    validatePostRemoveFeesFromPaymentGroupPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if one of the 'selectedFeeRecordIds' items is less than one`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      selectedFeeRecordIds: [7, 8, -1],
    };
    req.body = invalidPayload;

    // Act
    validatePostRemoveFeesFromPaymentGroupPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });
});
