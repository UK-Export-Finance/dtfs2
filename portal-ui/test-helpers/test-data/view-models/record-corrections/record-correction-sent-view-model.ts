import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import { PRIMARY_NAV_KEY } from '@ukef/portal-ui/server/constants';
import { RecordCorrectionSentViewModel } from '@ukef/portal-ui/server/types/view-models/record-correction/record-correction-sent';

export const aRecordCorrectionSentViewModel = (): RecordCorrectionSentViewModel => ({
  user: aPortalSessionUser(),
  primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
  sentToEmails: ['email1@ukexportfinance.gov.uk'],
  formattedReportPeriod: 'January 2021',
});
