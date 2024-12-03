/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { Request, Response, NextFunction } from 'express';

export const validateParametersMiddleware = (schema: any, property: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema[property].validate(req.params);
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const currentValue = req.params[property];
      const message = details.map((i: any) => i.message).join(',');
      res.status(400).json({
        error: message,
        currentValue,
        status: 400,
      });
    }
  };
};
