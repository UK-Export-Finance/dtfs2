import { Response, Request } from 'express';
import { CURRENCY, mapReasonsToDisplayValues, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { asLoggedInUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { UtilisationReportCorrectionInformationViewModel } from '../../../../types/view-models/record-correction/utilisation-report-correction-information';
import { formatCorrectedValues } from './helpers';
import { GetFeeRecordCorrectionReviewResponseBody } from '../../../../api-response-types';

const renderCheckTheInformationPage = (res: Response, viewModel: UtilisationReportCorrectionInformationViewModel) =>
  res.render('utilisation-report-service/record-correction/check-the-information.njk', viewModel);

/**
 * Renders the "check the information" page for a record correction
 * @param req - the request
 * @param res - the response
 */
export const getRecordCorrectionInformation = (req: Request, res: Response) => {
  const { user } = asLoggedInUserSession(req.session);

  try {
    // const { correctionId } = req.params;

    // const bankId = user.bank.id;
    // const userId = user._id;

    // TODO: Remove stub after debug.
    const { correctionId, feeRecord, reasons, errorSummary, oldValues, newValues, bankCommentary }: GetFeeRecordCorrectionReviewResponseBody = {
      correctionId: 1,
      feeRecord: {
        exporter: 'Some exporter',
        reportedFees: {
          currency: CURRENCY.GBP,
          amount: 7,
        },
      },
      reasons: [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT],
      errorSummary: 'PDC error summary here.',
      oldValues: {
        utilisation: 77,
        facilityId: '7777777',
      },
      newValues: {
        utilisation: 80,
        facilityId: '12345678',
      },
      bankCommentary: 'Bank commentary here',
    };

    // await api.getFeeRecordCorrectionReview(bankId, correctionId, userId, userToken);

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
