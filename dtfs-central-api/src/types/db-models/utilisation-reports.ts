import { UtilisationReport, Prettify, UTILISATION_REPORT_RECONCILIATION_STATUS, UploadedByUserDetails } from '@ukef/dtfs2-common';

export type UtilisationReportUploadDetails = Prettify<
  Required<
    Pick<UtilisationReport, 'azureFileInfo' | 'dateUploaded' | 'uploadedBy'> & {
      status: typeof UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;
    }
  >
>;

export { UtilisationReport, UploadedByUserDetails };
