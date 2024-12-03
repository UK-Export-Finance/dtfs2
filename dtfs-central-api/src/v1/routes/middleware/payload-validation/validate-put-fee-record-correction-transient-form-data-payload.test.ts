import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT, RECORD_CORRECTION_REASON, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../../test-helpers';
import {
  PutFeeRecordCorrectionTransientFormDataPayload,
  validatePutFeeRecordCorrectionTransientFormDataPayload,
} from './validate-put-fee-record-correction-transient-form-data-payload';

describe('validatePutFeeRecordCorrectionTransientFormDataPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const requiredPayloadKeys: (keyof PutFeeRecordCorrectionTransientFormDataPayload)[] = ['formData', 'user'];
  const requiredFormDataPayloadKeys: (keyof RecordCorrectionTransientFormData)[] = ['reasons', 'additionalInfo'];

  const aValidPayload = (): PutFeeRecordCorrectionTransientFormDataPayload => ({
    formData: {
      reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER],
      additionalInfo: 'Some additional info',
    },
    user: aTfmSessionUser(),
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

  it.each(requiredFormDataPayloadKeys)(
    `should respond with a '${HttpStatusCode.BadRequest}' if the '%s' field is missing from the 'formData' object field`,
    (payloadKey) => {
      // Arrange
      const { req, res } = getHttpMocks();
      const next = jest.fn();

      const validPayload = aValidPayload();
      const invalidPayload = {
        ...validPayload,
        formData: {
          ...validPayload.formData,
          [payloadKey]: undefined,
        },
      };

      req.body = invalidPayload;

      // Act
      validatePutFeeRecordCorrectionTransientFormDataPayload(req, res, next);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._isEndCalled()).toEqual(true);
      expect(next).not.toHaveBeenCalled();
    },
  );

  it(`should respond with a '${HttpStatusCode.BadRequest}' if one of the formData 'reasons' items is not a RECORD_CORRECTION_REASON`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const validPayload = aValidPayload();
    const invalidPayload = {
      ...validPayload,
      formData: {
        ...validPayload.formData,
        reasons: ['invalid-reason'],
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

  it(`should respond with a '${HttpStatusCode.BadRequest}' if the formData 'reasons' array is empty`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = aValidPayload();
    invalidPayload.formData.reasons = [];

    req.body = invalidPayload;

    // Act
    validatePutFeeRecordCorrectionTransientFormDataPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`should respond with a '${HttpStatusCode.BadRequest}' if the formData 'additionalInfo' field is an empty string`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = aValidPayload();
    invalidPayload.formData.additionalInfo = '';

    req.body = invalidPayload;

    // Act
    validatePutFeeRecordCorrectionTransientFormDataPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`should respond with a '${HttpStatusCode.BadRequest}' if the formData 'additionalInfo' field is a string with more than ${MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT} characters`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = aValidPayload();
    invalidPayload.formData.additionalInfo = 'a'.repeat(MAX_RECORD_CORRECTION_ADDITIONAL_INFO_CHARACTER_COUNT + 1);

    req.body = invalidPayload;

    // Act
    validatePutFeeRecordCorrectionTransientFormDataPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });
});
