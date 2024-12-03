import { Response, Request } from 'express';
import { RecordCorrectionRequestInformationViewModel } from '../../../../types/view-models';
import { asUserSession } from '../../../../helpers/express-session';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { getLinkToPremiumPaymentsTab } from '../../helpers/get-link-to-premium-payments-tab';
import api from '../../../../api';

const renderCheckTheInformationPage = (res: Response, viewModel: RecordCorrectionRequestInformationViewModel) =>
  res.render('utilisation-reports/record-corrections/check-the-information.njk', viewModel);

export const getRecordCorrectionRequestInformation = (req: Request, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user } = asUserSession(req.session);

    return renderCheckTheInformationPage(res, {
      user,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bank: {
        name: 'Test bank',
      },
      reportId,
      feeRecordId,
      facilityId: '0012345678',
      exporter: 'Test company',
      formattedReportPeriod: 'July 2024',
      reasonForRecordCorrection: 'Facility ID is incorrect',
      additionalInfo: 'The facility ID does not match the facility ID held on file',
      contactEmailAddress: 'email address',
      cancelLink: getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]),
    });
  } catch (error) {
    console.error('Failed to render create record correction request - "check the information" page', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

export const postRecordCorrectionRequestInformation = async (req: Request, res: Response) => {
  try {
    const { reportId, feeRecordId } = req.params;
    const { user, userToken } = asUserSession(req.session);

    await api.createFeeRecordCorrection(reportId, feeRecordId, user, userToken);

    return res.redirect(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/request-sent`);
  } catch (error) {
    console.error('Failed to render create record correction request - "check the information" page', error);
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};
