import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'typeorm';
import {
  PutFeeRecordCorrectionTransientFormDataPayload,
  validatePutFeeRecordCorrectionTransientFormDataPayload,
} from './validate-put-fee-record-correction-transient-form-data-payload';

describe('validatePutFeeRecordCorrectionTransientFormDataPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const requiredPayloadKeys: (keyof PutFeeRecordCorrectionTransientFormDataPayload)[] = ['formData', 'user'];
  const formDataKeys: (keyof PutFeeRecordCorrectionTransientFormDataPayload['formData'])[] = [
    'utilisation',
    'facilityId',
    'reportedCurrency',
    'reportedFee',
    'additionalComments',
  ];

  const aValidPayload = (): PutFeeRecordCorrectionTransientFormDataPayload => ({
    formData: {},
    user: { id: new ObjectId().toString() },
  });

  it.each(requiredPayloadKeys)(`should respond with a '${HttpStatusCode.BadRequest}' if the '%s' field is missing`, (payloadKey) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      [payloadKey]: undefined,
    };
    req.body = invalidPayload;

    // Act
    validatePutFeeRecordCorrectionTransientFormDataPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`should respond with a '${HttpStatusCode.BadRequest}' if user.id is not a valid mongo id`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      user: { id: 'invalidObjectId' },
    };
    req.body = invalidPayload;

    // Act
    validatePutFeeRecordCorrectionTransientFormDataPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it.each(formDataKeys)(`should respond with a '${HttpStatusCode.BadRequest}' if formData field %s is provided and not a string`, (formDataKey) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      formData: {
        [formDataKey]: 123,
      },
    };
    req.body = invalidPayload;

    // Act
    validatePutFeeRecordCorrectionTransientFormDataPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });
});
