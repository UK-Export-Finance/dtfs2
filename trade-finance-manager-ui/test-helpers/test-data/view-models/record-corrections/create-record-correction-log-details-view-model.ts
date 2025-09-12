import { recordCorrectionLogDetailsMock } from '@ukef/dtfs2-common/test-helpers';
import { getFormattedReportPeriodWithLongMonth, UTILISATION_REPORT_STATUS_TAG_COLOURS } from '@ukef/dtfs2-common';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../server/constants';
import { RecordCorrectionLogDetailsViewModel } from '../../../../server/types/view-models';
import { aTfmSessionUser } from '../../tfm-session-user';
import { mapToRecordCorrectionStatus } from '../../../../server/controllers/utilisation-reports/helpers/map-record-correction-status';

const { status, displayStatus } = mapToRecordCorrectionStatus(recordCorrectionLogDetailsMock.correctionDetails.isCompleted);

const formattedReportPeriod = getFormattedReportPeriodWithLongMonth(recordCorrectionLogDetailsMock.reportPeriod);

export const aCreateRecordCorrectionLogDetailsViewModel = (): RecordCorrectionLogDetailsViewModel => ({
  user: aTfmSessionUser(),
  activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
  status,
  displayStatus,
  ...recordCorrectionLogDetailsMock,
  formattedReportPeriod,
  backLinkHref: '/utilisation-reports/123#record-correction-log',
  statusTagColours: UTILISATION_REPORT_STATUS_TAG_COLOURS,
});
