import { Response } from 'express';
import { CustomExpressRequest, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestErrorsViewModel, CreateRecordCorrectionRequestViewModel } from '@tfm-ui/types/view-models';
import { asUserSession } from '@tfm-ui/helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '@tfm-ui/constants';
import { getLinkToPremiumPaymentsTab } from '@tfm-ui/controllers/utilisation-reports/helpers';
import api from '@tfm-ui/api';
import { getRecordCorrectionRequestCancelLinkHref } from '@tfm-ui/controllers/utilisation-reports/record-corrections/helpers';
import { CreateRecordCorrectionRequestFormRequestBody, extractCreateRecordCorrectionRequestFormValues } from './form-helpers';
import { validateCreateRecordCorrectionRequestFormValues } from './validate-form-values';

const createRecordCorrectionRequestTemplate = 'utilisation-reports/record-corrections/create-record-correction-request.njk';

export type GetCreateRecordCorrectionRequestRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

export const EMPTY_CREATE_RECORD_CORRECTION_REQUEST_ERRORS_VIEW_MODEL: CreateRecordCorrectionRequestErrorsViewModel = Object.freeze({ errorSummary: [] });

/**
 * Controller for the GET create record correction request route
 * @param req - The request object
 * @param res - The response object
 */
export const getCreateRecordCorrectionRequest = async (req: GetCreateRecordCorrectionRequestRequest, res: Response) => {
  try {
    const { user, userToken } = asUserSession(req.session);
    const { reportId, feeRecordId } = req.params;

    const feeRecord = await api.getFeeRecord(reportId, feeRecordId, userToken);
    const formValues = await api.getFeeRecordCorrectionTransientFormData(reportId, feeRecordId, user, userToken);

    const viewModel: CreateRecordCorrectionRequestViewModel = {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportId,
      cancelLinkHref: getRecordCorrectionRequestCancelLinkHref(reportId, feeRecordId),
      bank: {
        name: feeRecord.bank.name,
      },
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(feeRecord.reportPeriod),
      feeRecord: {
        facilityId: feeRecord.facilityId,
        exporter: feeRecord.exporter,
      },
      formValues,
      errors: EMPTY_CREATE_RECORD_CORRECTION_REQUEST_ERRORS_VIEW_MODEL,
      backLinkHref: getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]),
    };

    return res.render(createRecordCorrectionRequestTemplate, viewModel);
  } catch (error) {
    console.error('Failed to get create record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

export type PostCreateRecordCorrectionRequestRequest = CustomExpressRequest<{
  reqBody: CreateRecordCorrectionRequestFormRequestBody;
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

/**
 * Controller for the POST create record correction request route
 * @param req - The request object
 * @param res - The response object
 */
export const postCreateRecordCorrectionRequest = async (req: PostCreateRecordCorrectionRequestRequest, res: Response) => {
  try {
    const { user, userToken } = asUserSession(req.session);
    const { reportId, feeRecordId } = req.params;

    const formValues = extractCreateRecordCorrectionRequestFormValues(req.body);

    const { errors, validatedFormValues } = validateCreateRecordCorrectionRequestFormValues(formValues);

    if (!errors) {
      await api.updateFeeRecordCorrectionTransientFormData(reportId, feeRecordId, validatedFormValues, user, userToken);

      return res.redirect(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/check-the-information`);
    }

    const feeRecord = await api.getFeeRecord(reportId, feeRecordId, userToken);

    const viewModel: CreateRecordCorrectionRequestViewModel = {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportId,
      bank: {
        name: feeRecord.bank.name,
      },
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(feeRecord.reportPeriod),
      feeRecord: {
        facilityId: feeRecord.facilityId,
        exporter: feeRecord.exporter,
      },
      formValues,
      errors,
      backLinkHref: getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]),
      cancelLinkHref: getRecordCorrectionRequestCancelLinkHref(reportId, feeRecordId),
    };

    return res.render(createRecordCorrectionRequestTemplate, viewModel);
  } catch (error) {
    console.error('Failed to post create record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
