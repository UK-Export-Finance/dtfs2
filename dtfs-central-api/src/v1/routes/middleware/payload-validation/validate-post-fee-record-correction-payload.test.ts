import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { aTfmSessionUser } from '../../../../../test-helpers/test-data/tfm-session-user';
import { PostFeeRecordCorrectionPayload, validatePostFeeRecordCorrectionPayload } from './validate-post-fee-record-correction-payload';

console.error = jest.fn();

describe('validatePostFeeRecordCorrectionPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidPayload = (): PostFeeRecordCorrectionPayload => ({
    user: aTfmSessionUser(),
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the user field is missing`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      user: undefined,
    };
    req.body = invalidPayload;

    // Act
    validatePostFeeRecordCorrectionPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if the user field is invalid`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {
      ...aValidPayload(),
      user: { invalidField: 'value' },
    };
    req.body = invalidPayload;

    // Act
    validatePostFeeRecordCorrectionPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls the 'next' function if the payload is valid", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = aValidPayload();

    // Act
    validatePostFeeRecordCorrectionPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
