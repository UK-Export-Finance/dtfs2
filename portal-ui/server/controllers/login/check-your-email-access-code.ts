import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { getNextAccessCodePage } from '../../helpers/login/get-next-access-code-page';

export type GetCheckYourEmailAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: {
    attemptsLeft?: number;
  };
};

/**
 * Controller to get the check your email Access Code page
 * @param req - the request object
 * @param res - the response object
 */
export const getCheckYourEmailAccessCodePage = (req: GetCheckYourEmailAccessCodePageRequest, res: Response) => {
  const {
    session: { attemptsLeft: sessionAttemptsLeft },
  } = req;

  if (typeof sessionAttemptsLeft !== 'number') {
    console.error('Number of send sign in link attempts remaining was not present in the session.');
    return res.render('_partials/problem-with-service.njk');
  }

  if (sessionAttemptsLeft > 3) {
    console.error(`Number of send sign in link attempts remaining was not within expected bounds: ${sessionAttemptsLeft}`);
    return res.render('_partials/problem-with-service.njk');
  }
  const result: { requestNewCodeUrl?: string; error?: boolean } = getNextAccessCodePage(sessionAttemptsLeft);

  const { requestNewCodeUrl } = result;

  const viewModel: { attemptsLeft?: number; requestNewCodeUrl?: string } = {
    attemptsLeft: sessionAttemptsLeft,
    requestNewCodeUrl,
  };

  try {
    return res.render(`${requestNewCodeUrl}.njk`, viewModel);
  } catch (error) {
    console.error('Error getting access code page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
