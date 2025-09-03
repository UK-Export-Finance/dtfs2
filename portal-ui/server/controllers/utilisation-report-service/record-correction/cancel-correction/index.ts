import { Response, Request } from 'express';
import { asLoggedInUserSession } from '../../../../helpers/express-session';
import api from '../../../../api';

export type CancelUtilisationReportCorrectionRequest = Request & {
  params: {
    correctionId: string;
  };
};

/**
 * POST controller for the cancel correction route.
 *
 * Calls the DTFS Central API to delete any fee record correction
 * transient form data for the correction previously saved by the user.
 *
 * Redirects the user to the utilisation report home page.
 * @param req - the request
 * @param res - the response
 */
export const cancelUtilisationReportCorrection = async (req: CancelUtilisationReportCorrectionRequest, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);

  try {
    const { correctionId } = req.params;

    const bankId = user.bank.id;

    await api.deleteFeeRecordCorrectionTransientFormData(userToken, bankId, correctionId);

    return res.redirect('/utilisation-report-upload');
  } catch (error) {
    console.error('Failed to cancel correction: %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
