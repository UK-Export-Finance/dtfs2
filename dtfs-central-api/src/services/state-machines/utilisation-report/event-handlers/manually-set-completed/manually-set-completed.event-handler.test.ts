import { EntityManager } from 'typeorm';
import {
  DbRequestSource,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  getDbAuditUpdatedByUserId,
} from '@ukef/dtfs2-common';
import { handleUtilisationReportManuallySetCompletedEvent } from './manually-set-completed.event-handler';

describe('handleUtilisationReportManuallySetCompletedEvent', () => {
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: 'abc123',
  };
  const updatedByUserId = getDbAuditUpdatedByUserId(requestSource);

  const mockSave = jest.fn();

  const mockRepository = {
    save: mockSave,
  };

  it('calls the correct repo methods and updates the report', async () => {
    // Arrange
    const mockGetRepository = jest.fn().mockReturnValue(mockRepository);
    const mockEntityManager = {
      getRepository: mockGetRepository,
    } as unknown as EntityManager;

    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();

    // Act
    await handleUtilisationReportManuallySetCompletedEvent(report, {
      requestSource,
      transactionEntityManager: mockEntityManager,
    });

    // Assert
    expect(mockGetRepository).toHaveBeenCalledWith(UtilisationReportEntity);
    expect(mockSave).toHaveBeenCalledWith(report);
    expect(report.status).toEqual(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);
    expect(report.updatedByUserId).toEqual(updatedByUserId);
  });
});
