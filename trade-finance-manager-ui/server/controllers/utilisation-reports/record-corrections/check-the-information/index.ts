import { Response, Request } from 'express';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { RecordCorrectionRequestInformationViewModel } from '../../../../types/view-models';
import { asUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { getLinkToPremiumPaymentsTab } from '../../helpers/get-link-to-premium-payments-tab';
import api from '../../../../api';
import { mapReasonsToDisplayValues } from '../helpers';

const renderCheckTheInformationPage = (res: Response, viewModel: RecordCorrectionRequestInformationViewModel) =>
  res.render('utilisation-reports/record-corrections/check-the-information.njk', viewModel);

/**
 * Renders the "check the information" page for a record correction request
 * @param req - the request
 * @param res - the response
 */
export const getRecordCorrectionRequestInformation = async (req: Request, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, userToken } = asUserSession(req.session);

    const { bank, reportPeriod, correctionRequestDetails } = await api.getFeeRecordCorrectionRequestReview(reportId, feeRecordId, user._id, userToken);
    const { facilityId, exporter, reasons, additionalInfo, contactEmailAddresses } = correctionRequestDetails;

    return renderCheckTheInformationPage(res, {
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
      contactEmailAddresses: contactEmailAddresses.join(', '),
      cancelLink: getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]),
    });
  } catch (error) {
    console.error('Failed to render create record correction request - "check the information" page', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
