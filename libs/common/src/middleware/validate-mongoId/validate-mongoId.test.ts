import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { validateMongoId } from './validate-mongoId';
import { API_ERROR_CODE } from '../../constants/api-error-code';

describe('validateMongoId', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next if the path parameter is a valid mongo id', () => {
    req.params = { id: '507f1f77bcf86cd799439011' };

    const middleware = validateMongoId('id');
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(res.send).toHaveBeenCalledTimes(0);
  });

  it(`should return ${HttpStatusCode.BadRequest} if the path parameter is not a valid mongo id`, () => {
    req.params = { id: 'invalid-mongo-id' };

    const middleware = validateMongoId('id');
    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
    expect(res.send).toHaveBeenCalledWith({
      message: "Expected path parameter 'id' to be a valid mongo id",
      code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
    });
  });
});
