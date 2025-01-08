import { Response, Request } from 'express';
import { mapReasonsToDisplayValues } from '@ukef/dtfs2-common';
import api from '../../../../api';
import { asLoggedInUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { UtilisationReportCorrectionInformationViewModel } from '../../../../types/view-models/record-correction/utilisation-report-correction-information';
import { formatCorrectedValues } from './helpers';

const renderCheckTheInformationPage = (res: Response, viewModel: UtilisationReportCorrectionInformationViewModel) =>
  res.render('utilisation-report-service/record-correction/check-the-information.njk', viewModel);

/**
 * Renders the "check the information" page for a record correction
 * @param req - the request
 * @param res - the response
 */
export const getRecordCorrectionInformation = async (req: Request, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);

  try {
    const { correctionId } = req.params;

    const bankId = user.bank.id;
    const userId = user._id;

    const { feeRecord, reasons, errorSummary, oldValues, newValues, bankCommentary } = await api.getFeeRecordCorrectionReview(
      bankId,
      correctionId,
      userId,
      userToken,
    );

    const formattedOldValues = formatCorrectedValues(oldValues, reasons);
    const formattedNewValues = formatCorrectedValues(newValues, reasons);

    const backLinkHref = `/utilisation-reports/provide-correction/${correctionId}`;

    return renderCheckTheInformationPage(res, {
      user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      backLinkHref,
      feeRecord,
      formattedReasons: mapReasonsToDisplayValues(reasons).join(', '),
      errorSummary,
      formattedOldValues,
      formattedNewValues,
      bankCommentary: bankCommentary ?? '-',
    });
  } catch (error) {
    console.error('Failed to render record correction - "check the information" page: %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
