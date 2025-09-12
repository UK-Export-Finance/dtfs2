import { aPortalSessionUser } from '@ukef/dtfs2-common/test-helpers';
import { CURRENCY, mapCurrenciesToRadioItems, RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { ProvideUtilisationReportCorrectionViewModel } from '../../../../server/types/view-models/record-correction/provide-utilisation-report-correction';
import { PRIMARY_NAV_KEY } from '../../../../server/constants';

export const aProvideUtilisationReportCorrectionViewModel = (): ProvideUtilisationReportCorrectionViewModel => ({
  user: aPortalSessionUser(),
  primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
  cancelLinkHref: '/utilisation-reports/cancel-correction/987',
  correctionRequestDetails: {
    facilityId: '12345678',
    exporter: 'exporter name',
    formattedReportedFees: `${CURRENCY.GBP} 77`,
    reasons: [RECORD_CORRECTION_REASON.OTHER],
    formattedReasons: 'Other',
    additionalInfo: 'Some additional info',
    errorTypeHeader: 'Error type',
  },
  paymentCurrencyOptions: mapCurrenciesToRadioItems(),
  additionalComments: {
    label: 'Additional comments label',
    hint: 'Additional comments hint',
  },
  formValues: {
    additionalComments: 'Some additional comments',
    facilityId: null,
    utilisation: null,
    reportedFee: null,
  },
});
