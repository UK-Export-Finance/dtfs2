import { PRIMARY_NAVIGATION_KEYS } from '../../../../server/constants';
import { RecordCorrectionRequestSentViewModel } from '../../../../server/types/view-models';
import { aTfmSessionUser } from '../../tfm-session-user';

export const aRecordCorrectionRequestSentViewModel = (): RecordCorrectionRequestSentViewModel => ({
  user: aTfmSessionUser(),
  activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
  bank: { name: 'Test bank' },
  formattedReportPeriod: 'May 2024',
  reportId: '123',
  requestedByUserEmail: 'user@ukexportfinance.gov.uk',
  emailsWithoutRequestedByUserEmail: ['test1@ukexportfinance.gov.uk', 'test2@ukexportfinance.gov.uk'],
});
