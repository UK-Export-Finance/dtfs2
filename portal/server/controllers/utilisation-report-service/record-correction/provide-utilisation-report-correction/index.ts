import { Request, Response } from 'express';
import { mapCurrenciesToRadioItems } from '@ukef/dtfs2-common';
import api from '../../../../api';
import { asLoggedInUserSession } from '../../../../helpers/express-session';
import { ProvideUtilisationReportCorrectionViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { getAdditionalCommentsFieldLabels, mapToCorrectionRequestDetailsViewModel } from './helpers';

export type GetProvideUtilisationReportCorrection = Request & {
  params: {
    correctionId: string;
  };
};

const renderProvideUtilisationReportCorrectionPage = (res: Response, viewModel: ProvideUtilisationReportCorrectionViewModel) =>
  res.render('utilisation-report-service/record-correction/provide-utilisation-report-correction.njk', viewModel);

/**
 * Controller for the GET provide utilisation report correction route.
 * @param req - The request object
 * @param res - The response object
 */
export const getProvideUtilisationReportCorrection = async (req: GetProvideUtilisationReportCorrection, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);

  try {
    const { correctionId } = req.params;

    const bankId = user.bank.id;

    const feeRecordCorrection = await api.getFeeRecordCorrection(userToken, bankId, correctionId);

    const paymentCurrencyOptions = mapCurrenciesToRadioItems();

    const additionalCommentsLabels = getAdditionalCommentsFieldLabels(feeRecordCorrection.reasons);

    return renderProvideUtilisationReportCorrectionPage(res, {
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      correctionRequestDetails: mapToCorrectionRequestDetailsViewModel(feeRecordCorrection),
      paymentCurrencyOptions,
      additionalComments: additionalCommentsLabels,
    });
  } catch (error) {
    console.error('Failed to get provide utilisation report correction %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};
