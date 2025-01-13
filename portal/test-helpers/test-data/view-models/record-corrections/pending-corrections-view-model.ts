import { aPortalSessionUser } from '@ukef/dtfs2-common';
import { PendingCorrectionsViewModel } from '../../../../server/types/view-models/record-correction/pending-corrections';
import { PRIMARY_NAV_KEY } from '../../../../server/constants';

export const aPendingCorrectionsViewModel = (): PendingCorrectionsViewModel => ({
  user: aPortalSessionUser(),
  primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
  formattedReportPeriod: 'January 2021',
  uploadedByFullName: 'John Doe',
  formattedDateUploaded: '2nd February 2021',
  corrections: [
    {
      correctionId: 1,
      facilityId: 'FAC-1',
      exporter: 'Exporter 1',
      additionalInfo: 'Additional info 1',
    },
    {
      correctionId: 2,
      facilityId: 'FAC-2',
      exporter: 'Exporter 2',
      additionalInfo: 'Additional info 2',
    },
  ],
  nextAction: {
    reportCurrentlyDueForUpload: {
      formattedReportPeriod: 'February 2021',
    },
  },
});
