import { Request, Response } from 'express';

/**
 * Controller to get the temporarily suspended page.
 * @param _req - the request object (unused)
 * @param res - the response object
 */
export const getAccountSuspendedPage = (_req: Request, res: Response) => res.render('login/temporarily-suspended-access-code.njk');
