import { Response } from 'express';
import { AccessCode, AttemptsLeft, CustomExpressRequest } from '@ukef/dtfs2-common';
import { getNextAccessCodePage } from '../../helpers/login/get-next-access-code-page';

export type GetAccessCodePageRequest = CustomExpressRequest<{
  params: { page: string };
}>;

/**
 * Controller to get the access code page based on the current page identifier.
 * Retrieves the appropriate attempts left and request new code URL for the page,
 * or redirects to not-found if the page is invalid.
 * @param req - The request object containing the page parameter
 * @param res - The response object
 */
export const getAccessCodePage = (req: GetAccessCodePageRequest, res: Response) => {
  const { page } = req.params;
  const result: { attemptsLeft?: AttemptsLeft; requestNewCodeUrl?: string; error?: boolean } = getNextAccessCodePage(page as AccessCode);

  if (result?.error) {
    console.error('Invalid access code page requested %s', page);
    return res.redirect('/not-found');
  }

  const { attemptsLeft, requestNewCodeUrl } = result;

  const viewModel: { attemptsLeft?: AttemptsLeft; requestNewCodeUrl?: string } = {
    attemptsLeft,
    requestNewCodeUrl,
  };

  try {
    return res.render(`login/access-code/${page}.njk`, viewModel);
  } catch (error) {
    console.error('Error getting access code page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
