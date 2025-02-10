import { Response, Request } from 'express';
import { mapReasonsToDisplayValues, getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { RecordCorrectionRequestInformationViewModel, ProblemWithServiceViewModel } from '../../../../types/view-models';
import { asUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import api from '../../../../api';
import { recordCorrectionRequestAlreadySubmitted, isRecordCorrectionRequestReviewResponseType } from '../../helpers';
import { getRecordCorrectionRequestCancelLinkHref } from '../helpers';

/**
 * Renders the "check the information" page for a record correction request
 * @param req - the request
 * @param res - the response
 */
export const getRecordCorrectionRequestInformation = async (req: Request, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, userToken } = asUserSession(req.session);

    const bankCorrectionRequestReviewResponse = await api.getFeeRecordCorrectionRequestReview(reportId, feeRecordId, user._id, userToken);

    const problemWithServiceViewModel: ProblemWithServiceViewModel = {
      reason: 'The record correction request has been sent to the bank. You cannot make any changes to the request',
      reportId,
      user: req.session.user,
    };

    /**
     * if record correction is already submitted
     * should render page-not-found with custom reason
     */
    if (recordCorrectionRequestAlreadySubmitted(bankCorrectionRequestReviewResponse)) {
      return res.render('utilisation-reports/page-not-found.njk', problemWithServiceViewModel);
    }

    /**
     * if bankCorrectionRequestReviewResponse returns an incorrect response type (should be FeeRecordCorrectionRequestReviewResponseBody)
     * throws error
     */
    if (!isRecordCorrectionRequestReviewResponseType(bankCorrectionRequestReviewResponse)) {
      throw new Error('Invalid response body for record correction request review');
    }

    const { bank, reportPeriod, correctionRequestDetails } = bankCorrectionRequestReviewResponse;

    const { facilityId, exporter, reasons, additionalInfo, contactEmailAddresses } = correctionRequestDetails;

    const checkTheInformationViewModel: RecordCorrectionRequestInformationViewModel = {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank: {
        name: bank.name,
      },
      reportId,
      feeRecordId,
      facilityId,
      exporter,
      formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
      reasonForRecordCorrection: mapReasonsToDisplayValues(reasons).join(', '),
      additionalInfo,
      contactEmailAddresses,
      cancelLinkHref: getRecordCorrectionRequestCancelLinkHref(reportId, feeRecordId),
    };

    return res.render('utilisation-reports/record-corrections/check-the-information.njk', checkTheInformationViewModel);
  } catch (error) {
    console.error('Failed to render create record correction request - "check the information" page %o', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

/**
 * Controller for the POST record correction request check the info route.
 *
 * Creates the record correction and sends the request to the bank.
 * @param req - The request object
 * @param res - The response object
 */
export const postRecordCorrectionRequestInformation = async (req: Request, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, userToken } = asUserSession(req.session);

    const { emails } = await api.createFeeRecordCorrection(reportId, feeRecordId, user, userToken);

    if (!emails) {
      throw new Error('No record correction request emails returned from the API.');
    }

    req.session.recordCorrectionRequestEmails = emails;

    return res.redirect(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/request-sent`);
  } catch (error) {
    console.error('Failed to create record correction: %o', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
