import { NextFunction, Request, Response } from 'express';
import { isValidMongoId } from '../../helpers/validateIds';

export const validateMongoId = (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  if (!isValidMongoId(_id)) {
    console.error(`Invalid MongoDB '_id' param provided: '${_id}'`);
    return res.redirect('/not-found');
  }

  return next();
};
