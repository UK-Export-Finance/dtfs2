import { Request, Response } from 'express';

export const getReasonForCancellation = (req: Request, res: Response) => {
  return res.render('case/cancellation/reason-for-cancellation.njk', {
    ukefDealId: '0040613574',
  });
};
