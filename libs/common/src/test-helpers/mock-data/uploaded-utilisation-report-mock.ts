import { UtilisationReportEntityMockBuilder } from './utilisation-report.entity.mock-builder';
import { PENDING_RECONCILIATION } from '../../constants';

/**
 * creates a mock uploaded utilisation report
 * @param reportId
 * @param portalUserId
 * @param bankId
 * @returns a UtilisationReportEntity
 */
export const uploadedUtilisationReportMock = (reportId: number, portalUserId: string, bankId: string) =>
  UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withUploadedByUserId(portalUserId).withBankId(bankId).build();
