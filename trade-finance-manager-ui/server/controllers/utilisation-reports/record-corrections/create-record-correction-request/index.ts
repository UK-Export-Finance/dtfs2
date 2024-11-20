import { Response } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { CreateRecordCorrectionRequestErrorsViewModel, CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import { asUserSession } from '../../../../helpers/express-session';
import { CustomExpressRequest } from '../../../../types/custom-express-request';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import {
  CreateRecordCorrectionRequestFormRequestBody,
  extractCreateRecordCorrectionRequestFormValues,
  getReasonFromRecordCorrectionReasonCheckboxIds,
  getRecordCorrectionReasonCheckboxIdsFromObjectKeys,
} from './form-helpers';
import { validateCreateRecordCorrectionRequest } from './validate-form-values';
import { RecordCorrectionRequestReasonCheckboxId } from '../../../../types/record-correction-request-reason-checkbox-id';

export type GetCreateRecordCorrectionRequestRequest = CustomExpressRequest<{
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

const renderCreateRecordCorrectionRequestPage = (res: Response, viewModel: CreateRecordCorrectionRequestViewModel) =>
  res.render('utilisation-reports/record-corrections/create-record-correction-request.njk', viewModel);

const EMPTY_CREATE_RECORD_CORRECTION_REQUEST_ERRORS_VIEW_MODEL: CreateRecordCorrectionRequestErrorsViewModel = Object.freeze({ errorSummary: [] });

// TODO FN-3575: Add TSDOC
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
      errors: EMPTY_CREATE_RECORD_CORRECTION_REQUEST_ERRORS_VIEW_MODEL,
    });
  } catch (error) {
    console.error('Failed to get create record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

export type PostCreateRecordCorrectionRequest = CustomExpressRequest<{
  reqBody: CreateRecordCorrectionRequestFormRequestBody & Partial<Record<RecordCorrectionRequestReasonCheckboxId, 'on'>>;
  params: {
    reportId: string;
    feeRecordId: string;
  };
}>;

// TODO FN-3575: Add TSDOC
export const postCreateRecordCorrectionRequest = (req: PostCreateRecordCorrectionRequest, res: Response) => {
  try {
    const { user } = asUserSession(req.session);
    const { reportId, feeRecordId } = req.params;

    const formValues = extractCreateRecordCorrectionRequestFormValues(req.body);
    const checkedReasonCheckboxIds = getRecordCorrectionReasonCheckboxIdsFromObjectKeys(req.body);
    const reasons = getReasonFromRecordCorrectionReasonCheckboxIds(checkedReasonCheckboxIds);

    const errors = validateCreateRecordCorrectionRequest(formValues, reasons);
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

    // TODO FN-3575: Add checkedReasonCheckboxIds to the view model so we can keep these checked upon error.
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
      errors,
    });
  } catch (error) {
    console.error('Failed to post create record correction request', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
