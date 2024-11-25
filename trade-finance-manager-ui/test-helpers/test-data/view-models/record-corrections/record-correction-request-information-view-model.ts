import { PRIMARY_NAVIGATION_KEYS } from '../../../../server/constants';
import { RecordCorrectionRequestInformationViewModel } from '../../../../server/types/view-models';
import { aTfmSessionUser } from '../../tfm-session-user';

export const aRecordCorrectionRequestInformationViewModel = (): RecordCorrectionRequestInformationViewModel => ({
  user: aTfmSessionUser(),
  activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
  bank: { name: 'Test bank' },
  formattedReportPeriod: 'May 2024',
  reportId: '123',
  feeRecordId: '456',
  facilityId: '12345678',
  exporter: 'exporter name',
  reasonForRecordCorrection: 'not valid',
  additionalInfo: 'this is some more information',
  contactEmailAddress: 'test@testing.com',
  cancelLink: 'a cancel link',
});
