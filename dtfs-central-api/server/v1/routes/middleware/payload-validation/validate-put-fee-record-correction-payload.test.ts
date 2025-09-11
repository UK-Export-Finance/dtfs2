import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { validatePutFeeRecordCorrectionPayload } from './validate-put-fee-record-correction-payload';

describe('validatePutFeeRecordCorrectionPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  it(`should respond with a '${HttpStatusCode.BadRequest}' if the user field is missing`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const invalidPayload = {};
    req.body = invalidPayload;

    // Act
    validatePutFeeRecordCorrectionPayload(req, res, next);

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
      user: { _id: 'invalidObjectId' },
    };
    req.body = invalidPayload;

    // Act
    validatePutFeeRecordCorrectionPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call the 'next' function if the payload is valid", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    const validPayload = {
      user: { _id: new ObjectId().toString() },
    };
    req.body = validPayload;

    // Act
    validatePutFeeRecordCorrectionPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
