import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { SubmitAccessCodeViewModel } from '../../../types/view-models/2fa/submit-access-code-view-model';

const CHECK_YOUR_EMAIL_TEMPLATE = 'login/check-your-email-access-code.njk';

const REQUEST_NEW_CODE_URL = '/login/new-access-code';

type RenderAccessCodeErrorViewOptions = {
  res: Response;
  attemptsLeft?: number;
  email?: string;
  signInOTP?: string;
  validationErrors: SubmitAccessCodeViewModel['validationErrors'];
  templateName?: string;
  requestNewCodeUrl?: string;
};

/**
 * Renders the submit access code page with validation errors populated.
 *
 * @param options Options containing template data and response.
 * @returns Renders the access code form with validation errors populated.
 */
export const renderAccessCodeErrorView = ({
  res,
  attemptsLeft,
  email,
  signInOTP,
  validationErrors,
  templateName = CHECK_YOUR_EMAIL_TEMPLATE,
  requestNewCodeUrl = REQUEST_NEW_CODE_URL,
}: RenderAccessCodeErrorViewOptions): void => {
  const viewModel: SubmitAccessCodeViewModel = {
    attemptsLeft,
    requestNewCodeUrl,
    email,
    signInOTP,
    validationErrors,
  };

  res.status(HttpStatusCode.BadRequest).render(templateName, viewModel);
};
