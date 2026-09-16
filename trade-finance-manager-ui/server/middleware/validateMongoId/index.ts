import { Request, Response, NextFunction } from 'express';
import { isValidMongoId } from '../../helpers/validateIds';

export type ValidateMongoIdRequest = Request<{ _id: string }>;

export const validateMongoId = (req: ValidateMongoIdRequest, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  if (!isValidMongoId(_id)) {
    console.error(`Invalid MongoDB '_id' param provided: '${_id}'`);
    return res.redirect('/not-found');
  }

  return next();
};
