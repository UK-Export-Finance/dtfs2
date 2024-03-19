import { UtilisationDataEntityMockBuilder } from '.';
import { UtilisationReportEntityMockBuilder } from './utilisation-report.entity.mock-builder';

const mockUploadedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

export const MOCK_UTILISATION_DATA_ENTITY = UtilisationDataEntityMockBuilder.forReport(mockUploadedUtilisationReport).build();
