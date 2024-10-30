import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '@ukef/dtfs2-common';
import { UtilisationReportResponseBody } from '../../src/v1/api-response-types';

export const aUtilisationReportResponse = (): UtilisationReportResponseBody => ({
  id: 12,
  bankId: '12',
  reportPeriod: {
    start: {
      month: 11,
      year: 2023,
    },
    end: {
      month: 11,
      year: 2023,
    },
  },
  dateUploaded: '2023-02-01T00:00',
  azureFileInfo: {
    folder: 'folder_name',
    filename: 'test_file.csv',
    fullPath: 'folder_name/test_file.csv',
    url: 'url',
    mimetype: 'mimetype',
  },
  uploadedByUser: {
    id: '5099803df3f4948bd2f98391',
    firstname: 'first',
    surname: 'last',
  },
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
});

export const aNotReceivedUtilisationReportResponse = (): UtilisationReportResponseBody => ({
  id: 12,
  bankId: '12',
  reportPeriod: {
    start: {
      month: 11,
      year: 2023,
    },
    end: {
      month: 11,
      year: 2023,
    },
  },
  azureFileInfo: null,
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
  dateUploaded: null,
  uploadedByUser: null,
});
