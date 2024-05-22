import { EntityManager } from 'typeorm';
import { DbRequestSource, UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportManuallySetCompletedEvent } from './manually-set-completed.event-handler';

describe('handleUtilisationReportManuallySetCompletedEvent', () => {
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: 'abc123',
  };

  const mockSave = jest.fn();

  it('updates the report to a completed state and saves the report', async () => {
    // Arrange
    const mockEntityManager = {
      save: mockSave,
    } as unknown as EntityManager;

    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();

    // Act
    await handleUtilisationReportManuallySetCompletedEvent(report, {
      requestSource,
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
    expect(report.status).toBe(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);
    expect(report.lastUpdatedByIsSystemUser).toBe(false);
    expect(report.lastUpdatedByPortalUserId).toBeNull();
    expect(report.lastUpdatedByTfmUserId).toBe(requestSource.userId);
  });
});
