import { EntityManager } from 'typeorm';
import { DbRequestSource, REQUEST_PLATFORM_TYPE, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportManuallySetIncompleteEvent } from '.';

describe('handleUtilisationReportManuallySetIncompleteEvent', () => {
  const requestSource: DbRequestSource = {
    platform: REQUEST_PLATFORM_TYPE.TFM,
    userId: 'abc123',
  };

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
    expect(report).toEqual(
      expect.objectContaining<Partial<UtilisationReportEntity>>({
        status: 'PENDING_RECONCILIATION',
        lastUpdatedByTfmUserId: requestSource.userId,
        lastUpdatedByPortalUserId: null,
        lastUpdatedByIsSystemUser: false,
      }),
    );
  });
});
