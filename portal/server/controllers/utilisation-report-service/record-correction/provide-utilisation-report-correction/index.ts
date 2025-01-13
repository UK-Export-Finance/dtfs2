import { Request, Response } from 'express';
import { CustomExpressRequest, mapCurrenciesToRadioItems, RecordCorrectionFormValues } from '@ukef/dtfs2-common';
import api from '../../../../api';
import { asLoggedInUserSession } from '../../../../helpers/express-session';
import { ProvideUtilisationReportCorrectionViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { getAdditionalCommentsFieldLabels, mapToProvideCorrectionFormValuesViewModel, mapToCorrectionRequestDetailsViewModel } from './helpers';

export type GetProvideUtilisationReportCorrection = Request & {
  params: {
    correctionId: string;
  };
};

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

    const savedFormValues = await api.getFeeRecordCorrectionTransientFormData(userToken, bankId, correctionId);

    const paymentCurrencyOptions = mapCurrenciesToRadioItems(savedFormValues.reportedCurrency);

    const additionalCommentsLabels = getAdditionalCommentsFieldLabels(feeRecordCorrection.reasons);

    const viewModel: ProvideUtilisationReportCorrectionViewModel = {
      user,
      primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
      correctionRequestDetails: mapToCorrectionRequestDetailsViewModel(feeRecordCorrection),
      paymentCurrencyOptions,
      additionalComments: additionalCommentsLabels,
      formValues: mapToProvideCorrectionFormValuesViewModel(savedFormValues),
    };

    return res.render('utilisation-report-service/record-correction/provide-utilisation-report-correction.njk', viewModel);
  } catch (error) {
    console.error('Failed to get provide utilisation report correction %o', error);
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

export type PostProvideUtilisationReportCorrectionRequest = CustomExpressRequest<{
  params: {
    correctionId: string;
  };
  reqBody: RecordCorrectionFormValues;
}>;

/**
 * Controller for the POST provide utilisation report correction route.
 * @param req - The request object
 * @param res - The response object
 */
export const postProvideUtilisationReportCorrection = async (req: PostProvideUtilisationReportCorrectionRequest, res: Response) => {
  const { user, userToken } = asLoggedInUserSession(req.session);

  try {
    const { correctionId } = req.params;
    const { utilisation, facilityId, reportedCurrency, reportedFee, additionalComments } = req.body;

    const bankId = user.bank.id;

    const formData = {
      utilisation,
      facilityId,
      reportedCurrency,
      reportedFee,
      additionalComments,
    };

    // TODO FN-3688 PR 3: Handle validation response once implemented, render page errors if defined.
    await api.putFeeRecordCorrection(userToken, bankId, correctionId, formData);

    return res.redirect(`/utilisation-reports/provide-correction/${correctionId}/check-the-information`);
  } catch (error) {
    console.error('Failed to post provide utilisation report correction %o', error);

    return res.render('_partials/problem-with-service.njk', { user });
  }
};
