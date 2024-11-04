import { FeeRecordEntityMockBuilder } from '.';
import { PENDING_RECONCILIATION } from '../../constants';
import { UtilisationReportEntityMockBuilder } from './utilisation-report.entity.mock-builder';

const mockUploadedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).build();

export const MOCK_FEE_RECORD_ENTITY = FeeRecordEntityMockBuilder.forReport(mockUploadedUtilisationReport).build();
