import { FeeRecordEntityMockBuilder } from '.';
import { UTILISATION_REPORT_STATUS } from '../../constants';
import { UtilisationReportEntityMockBuilder } from './utilisation-report.entity.mock-builder';

const mockUploadedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION).build();

export const MOCK_FEE_RECORD_ENTITY = FeeRecordEntityMockBuilder.forReport(mockUploadedUtilisationReport).build();
