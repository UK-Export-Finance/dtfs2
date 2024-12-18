import { Request, Response } from 'express';
import api from '../../../../api';
import { asLoggedInUserSession } from '../../../../helpers/express-session';
import { ProvideUtilisationReportCorrectionViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { mapToCorrectionRecordViewModel } from './helpers';

export type GetProvideUtilisationReportCorrectionRequest = Request & {
  params: {
    correctionId: string;
  };
};

const renderProvideUtilisationReportCorrectionRequestPage = (res: Response, viewModel: ProvideUtilisationReportCorrectionViewModel) =>
  res.render('utilisation-report-service/record-correction/provide-utilisation-report-correction.njk', viewModel);

/**
 * Controller for the GET provide utilisation report correction route.
 * @param req - The request object
 * @param res - The response object
 */
export const getProvideUtilisationReportCorrection = async (req: GetProvideUtilisationReportCorrectionRequest, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);

  try {
    const { correctionId } = req.params;

    const bankId = user.bank.id;

    const feeRecordCorrection = await api.getFeeRecordCorrection(userToken, bankId, correctionId);

    return renderProvideUtilisationReportCorrectionRequestPage(res, {
      primaryNav: PRIMARY_NAV_KEY.REPORTS,
      correctionRecord: mapToCorrectionRecordViewModel(feeRecordCorrection),
    });
  } catch (error) {
    console.error('Failed to get provide utilisation report correction', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
