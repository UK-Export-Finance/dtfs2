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
