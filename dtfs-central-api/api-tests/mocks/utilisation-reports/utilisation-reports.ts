import { ObjectId } from 'mongodb';
import { UtilisationReport } from '../../../src/types/db-models/utilisation-reports';
import { MOCK_BANKS } from '../banks';
import { MOCK_AZURE_FILE_INFO } from '../azure-file-info';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../src/constants/utilisation-report-reconciliation-status';
import { MOCK_MONTHLY_REPORT_PERIOD } from '../report-period';

export const MOCK_UTILISATION_REPORT: UtilisationReport = {
  _id: new ObjectId('5099803df3f4948bd2f98391'),
  bank: {
    id: MOCK_BANKS.HSBC.id,
    name: MOCK_BANKS.HSBC.name,
  },
  reportPeriod: MOCK_MONTHLY_REPORT_PERIOD,
  dateUploaded: new Date('2023-11-15'),
  azureFileInfo: MOCK_AZURE_FILE_INFO,
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
  uploadedBy: {
    id: '5099803df3f4948bd2f98391',
    firstname: 'test',
    surname: 'user',
  },
};
