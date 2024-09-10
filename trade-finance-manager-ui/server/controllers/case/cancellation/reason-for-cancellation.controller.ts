import { Request, Response } from 'express';

/**
 * controller to get the reason for cancellation page
 */
export const getReasonForCancellation = (req: Request, res: Response) => {
  return res.render('case/cancellation/reason-for-cancellation.njk', {
    ukefDealId: '0040613574', // TODO: DTFS2-7350 get values from database
  });
};

// TODO: DTFS2-7349 add post request endpoint
