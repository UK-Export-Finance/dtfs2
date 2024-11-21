import { Response } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestErrorsViewModel, CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import { asUserSession } from '../../../../helpers/express-session';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { CreateRecordCorrectionRequestFormRequestBody, extractCreateRecordCorrectionRequestFormValues } from './form-helpers';
import { validateCreateRecordCorrectionRequestFormValues } from './validate-form-values';

export type GetCreateRecordCorrectionRequestRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

const renderCreateRecordCorrectionRequestPage = (res: Response, viewModel: CreateRecordCorrectionRequestViewModel) =>
  res.render('utilisation-reports/record-corrections/create-record-correction-request.njk', viewModel);

const EMPTY_CREATE_RECORD_CORRECTION_REQUEST_ERRORS_VIEW_MODEL: CreateRecordCorrectionRequestErrorsViewModel = Object.freeze({ errorSummary: [] });

/**
 * Controller for the GET create record correction request route
 * @param req - The request object
 * @param res - The response object
 */
export const getCreateRecordCorrectionRequest = (req: GetCreateRecordCorrectionRequestRequest, res: Response) => {
  try {
    const { user } = asUserSession(req.session);
    const { reportId } = req.params;

    const feeRecordDetails = {
      bank: {
        name: 'Test Bank',
      },
      reportPeriod: {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      },
      facilityId: '0012345678',
      exporter: 'Sample Company Ltd',
    };

    return renderCreateRecordCorrectionRequestPage(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportId,
      bank: feeRecordDetails.bank,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(feeRecordDetails.reportPeriod),
      feeRecord: {
        facilityId: feeRecordDetails.facilityId,
        exporter: feeRecordDetails.exporter,
      },
      formValues: {},
      errors: EMPTY_CREATE_RECORD_CORRECTION_REQUEST_ERRORS_VIEW_MODEL,
    });
  } catch (error) {
    console.error('Failed to get create record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

export type PostCreateRecordCorrectionRequest = CustomExpressRequest<{
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
export const postCreateRecordCorrectionRequest = (req: PostCreateRecordCorrectionRequest, res: Response) => {
  try {
    const { user } = asUserSession(req.session);
    const { reportId, feeRecordId } = req.params;

    const formValues = extractCreateRecordCorrectionRequestFormValues(req.body);

    const errors = validateCreateRecordCorrectionRequestFormValues(formValues);
    const formHasErrors = errors.errorSummary.length !== 0;

    if (!formHasErrors) {
      return res.redirect(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/check-the-information`);
    }

    // TODO: Change from this hardcoded version to using the new API endpoint once FN-3573 backend work is merged.
    const feeRecordDetails = {
      bank: {
        name: 'Test Bank',
      },
      reportPeriod: {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      },
      facilityId: '0012345678',
      exporter: 'Sample Company Ltd',
    };

    return renderCreateRecordCorrectionRequestPage(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportId,
      bank: feeRecordDetails.bank,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(feeRecordDetails.reportPeriod),
      feeRecord: {
        facilityId: feeRecordDetails.facilityId,
        exporter: feeRecordDetails.exporter,
      },
      formValues,
      errors,
    });
  } catch (error) {
    console.error('Failed to post create record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
