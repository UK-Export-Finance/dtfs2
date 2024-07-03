import { NextFunction, Request, Response } from 'express';
import { asUserSession } from '../../helpers/express-session';
const isRequestBodyAnObject = (body: unknown): body is object => !body || typeof body === 'object';

const renderProblemWithServiceView = (req: Request, res: Response) => {
  const { user } = asUserSession(req.session);
  return res.render('_partials/problem-with-service.njk', { user });
};
export const validatePostUnlinkPaymentFeesRequestBody = (req: Request, res: Response, next: NextFunction) => {
  const { reportId, paymentId } = req.params;

  const body = req.body as unknown;

  if (!isRequestBodyAnObject(body)) {
    return renderProblemWithServiceView(req, res);
  }

  return next();
};
