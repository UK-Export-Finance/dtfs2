import { PRIMARY_NAVIGATION_KEYS } from '../../../../server/constants';
import { CreateRecordCorrectionRequestViewModel } from '../../../../server/types/view-models';
import { aTfmSessionUser } from '../../tfm-session-user';

export const aCreateRecordCorrectionRequestViewModel = (): CreateRecordCorrectionRequestViewModel => ({
  user: aTfmSessionUser(),
  activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
  reportId: '123',
  bank: { name: 'Test bank ' },
  formattedReportPeriod: 'Some reporting period',
  feeRecord: {
    facilityId: '0012345678',
    exporter: 'Sample Company Ltd',
  },
  formValues: {},
  errors: { errorSummary: [] },
});
