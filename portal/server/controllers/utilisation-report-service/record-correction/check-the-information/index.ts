import { Response, Request } from 'express';
import { mapReasonsToDisplayValues } from '@ukef/dtfs2-common';
import api from '../../../../api';
import { asLoggedInUserSession, LoggedInUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { UtilisationReportCorrectionInformationViewModel } from '../../../../types/view-models/record-correction/utilisation-report-correction-information';

export type UtilisationReportCorrectionReviewRequest = Request & {
  params: {
    correctionId: string;
  };
};

/**
 * Renders the "check the information" page for a utilisation report correction
 * @param req - the request
 * @param res - the response
 */
export const getUtilisationReportCorrectionReview = async (req: UtilisationReportCorrectionReviewRequest, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);

  try {
    const { correctionId } = req.params;

    const bankId = user.bank.id;
    const userId = user._id;

    const { feeRecord, reasons, errorSummary, formattedOldValues, formattedNewValues, bankCommentary } = await api.getFeeRecordCorrectionReview(
      bankId,
      correctionId,
      userId,
      userToken,
    );

    const backLinkHref = `/utilisation-reports/provide-correction/${correctionId}`;

    const cancelLinkHref = `/utilisation-reports/cancel-correction/${correctionId}`;

    const viewModel: UtilisationReportCorrectionInformationViewModel = {
      user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      backLinkHref,
      cancelLinkHref,
      feeRecord,
      formattedReasons: mapReasonsToDisplayValues(reasons).join(', '),
      errorSummary,
      formattedOldValues,
      formattedNewValues,
      bankCommentary: bankCommentary ?? '-',
    };

    return res.render('utilisation-report-service/record-correction/check-the-information.njk', viewModel);
  } catch (error) {
    console.error('Failed to render utilisation report correction - "check the information" page: %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

/**
 * POST controller for the utilisation report correction review page.
 *
 * Calls the DTFS Central API to save the fee record correction.
 *
 * Sets the recordCorrectionSent session data and redirects to
 * the correction sent page on success.
 * @param req - the request
 * @param res - the response
 */
export const postUtilisationReportCorrectionReview = async (req: UtilisationReportCorrectionReviewRequest, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);

  try {
    const { correctionId } = req.params;

    const bankId = user.bank.id;

    const correctionSentData = await api.saveFeeRecordCorrection(userToken, bankId, correctionId);

    (req.session as LoggedInUserSession).recordCorrectionSent = correctionSentData;

    return res.redirect('/utilisation-reports/correction-sent');
  } catch (error) {
    console.error('Failed to save fee record correction: %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
