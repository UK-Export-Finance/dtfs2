import { HttpStatusCode } from 'axios';
import httpMocks from 'node-mocks-http';
import { validateMongoId } from './validate-mongoId';
import { API_ERROR_CODE } from '../../constants/api-error-code';

describe('validateMongoId', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  it('should call next if the path parameter is a valid mongo id', () => {
    const { req, res } = getHttpMocks();
    const next = jest.fn();
    req.params = { id: '507f1f77bcf86cd799439011' };

    const middleware = validateMongoId('id');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toEqual(HttpStatusCode.Ok);
  });

  it(`should return ${HttpStatusCode.BadRequest} if the path parameter is not provided`, () => {
    const { req, res } = getHttpMocks();
    const next = jest.fn();
    req.params = {};

    const middleware = validateMongoId('id');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(res.statusCode).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(res._getData()).toEqual({
      message: "Expected path parameter 'id' to be a valid mongo id",
      code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
    });
  });

  it(`should return ${HttpStatusCode.BadRequest} if the path parameter is not a valid mongo id`, () => {
    const { req, res } = getHttpMocks();
    const next = jest.fn();
    req.params = { id: 'invalid-mongo-id' };

    const middleware = validateMongoId('id');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(res.statusCode).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(res._getData()).toEqual({
      message: "Expected path parameter 'id' to be a valid mongo id",
      code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
    });
  });
});
