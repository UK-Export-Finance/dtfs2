import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  getDbAuditUpdatedByUserId,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportManuallySetIncompleteEvent } from '.';

describe('handleUtilisationReportManuallySetIncompleteEvent', () => {
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: 'abc123',
  };
  const updatedByUserId = getDbAuditUpdatedByUserId(requestSource);

  const mockSave = jest.fn();

  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  it("sets the report status to 'PENDING_RECONCILIATION' and saves the report using the transaction entity manager", async () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').build();

    // Act
    await handleUtilisationReportManuallySetIncompleteEvent(report, {
      requestSource,
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
    expect(report.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION);
    expect(report.updatedByUserId).toEqual(updatedByUserId);
  });
});
