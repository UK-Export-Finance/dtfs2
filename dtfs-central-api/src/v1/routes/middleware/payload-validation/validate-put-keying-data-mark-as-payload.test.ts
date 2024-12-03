import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { PutKeyingDataMarkAsPayload, validatePutKeyingDataMarkAsPayload } from './validate-put-keying-data-mark-as-payload';

describe('validatePutKeyingDataMarkAsPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const requiredPayloadKeys: (keyof PutKeyingDataMarkAsPayload)[] = ['feeRecordIds', 'user'];

  const aValidPayload = (): PutKeyingDataMarkAsPayload => ({
    feeRecordIds: [1],
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
    validatePutKeyingDataMarkAsPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
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
    validatePutKeyingDataMarkAsPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if one of the 'feeRecordIds' items is not an integer`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      feeRecordIds: [1, 2, 'three'],
    };
    req.body = invalidPayload;

    // Act
    validatePutKeyingDataMarkAsPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });
});
