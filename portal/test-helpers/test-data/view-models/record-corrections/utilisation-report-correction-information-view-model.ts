import { aPortalSessionUser, CURRENCY } from '@ukef/dtfs2-common';
import { PRIMARY_NAV_KEY } from '../../../../server/constants';
import { UtilisationReportCorrectionInformationViewModel } from '../../../../server/types/view-models/record-correction/utilisation-report-correction-information';

export const aUtilisationReportCorrectionInformationViewModel = (): UtilisationReportCorrectionInformationViewModel => ({
  user: aPortalSessionUser(),
  primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
  backLinkHref: '/utilisation-reports/provide-correction/7',
  feeRecord: {
    exporter: 'An exporter',
    reportedFees: {
      currency: 'GBP',
      amount: 123,
    },
  },
  formattedReasons: 'Facility ID is incorrect, Reported currency is incorrect',
  errorSummary: 'Some error summary',
  formattedOldValues: `77777777, ${CURRENCY.EUR}`,
  formattedNewValues: `88888888, ${CURRENCY.GBP}`,
  bankCommentary: 'Some bank commentary',
});
