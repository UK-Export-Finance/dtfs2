import { DbRequestSource, UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportPaymentAddedToFeeRecordEvent } from './payment-added-to-fee-record.event-handler';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';

describe('handleUtilisationReportPaymentAddedToFeeRecordEvent', () => {
  const tfmUserId = 'abc123';
  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId: tfmUserId,
  };

  const saveSpy = jest.spyOn(UtilisationReportRepo, 'save');

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe(`when the report status is '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}'`, () => {
    it("calls the 'UtilisationReportRepo.save' method once", async () => {
      // Arrange
      const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

      saveSpy.mockResolvedValue(PENDING_RECONCILIATION_REPORT);

      // Act
      await handleUtilisationReportPaymentAddedToFeeRecordEvent(PENDING_RECONCILIATION_REPORT, { requestSource });

      // Assert
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(PENDING_RECONCILIATION_REPORT);
    });

    it(`sets the report status to '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS}'`, async () => {
      // Arrange
      const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

      saveSpy.mockResolvedValue(PENDING_RECONCILIATION_REPORT);

      // Act
      await handleUtilisationReportPaymentAddedToFeeRecordEvent(PENDING_RECONCILIATION_REPORT, { requestSource });

      // Assert
      expect(PENDING_RECONCILIATION_REPORT.status).toBe(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS);
    });

    it(`sets the report 'lastUpdatedByIsSystemUser' field to 'false'`, async () => {
      // Arrange
      const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

      saveSpy.mockResolvedValue(PENDING_RECONCILIATION_REPORT);

      // Act
      await handleUtilisationReportPaymentAddedToFeeRecordEvent(PENDING_RECONCILIATION_REPORT, { requestSource });

      // Assert
      expect(PENDING_RECONCILIATION_REPORT.lastUpdatedByIsSystemUser).toBe(false);
    });

    it(`sets the report 'lastUpdatedByPortalUserId' field to 'null'`, async () => {
      // Arrange
      const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

      saveSpy.mockResolvedValue(PENDING_RECONCILIATION_REPORT);

      // Act
      await handleUtilisationReportPaymentAddedToFeeRecordEvent(PENDING_RECONCILIATION_REPORT, { requestSource });

      // Assert
      expect(PENDING_RECONCILIATION_REPORT.lastUpdatedByPortalUserId).toBe(null);
    });

    it(`sets the report 'lastUpdatedByTfmUserId' field to the request source user id`, async () => {
      // Arrange
      const PENDING_RECONCILIATION_REPORT = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

      saveSpy.mockResolvedValue(PENDING_RECONCILIATION_REPORT);

      // Act
      await handleUtilisationReportPaymentAddedToFeeRecordEvent(PENDING_RECONCILIATION_REPORT, { requestSource });

      // Assert
      expect(PENDING_RECONCILIATION_REPORT.lastUpdatedByTfmUserId).toBe(tfmUserId);
    });
  });

  describe(`when the report status is '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS}'`, () => {
    it("calls the 'UtilisationReportRepo.save' method once", async () => {
      // Arrange
      const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

      saveSpy.mockResolvedValue(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await handleUtilisationReportPaymentAddedToFeeRecordEvent(RECONCILIATION_IN_PROGRESS_REPORT, { requestSource });

      // Assert
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(RECONCILIATION_IN_PROGRESS_REPORT);
    });

    it(`sets the report 'lastUpdatedByIsSystemUser' field to 'false'`, async () => {
      // Arrange
      const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

      saveSpy.mockResolvedValue(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await handleUtilisationReportPaymentAddedToFeeRecordEvent(RECONCILIATION_IN_PROGRESS_REPORT, { requestSource });

      // Assert
      expect(RECONCILIATION_IN_PROGRESS_REPORT.lastUpdatedByIsSystemUser).toBe(false);
    });

    it(`sets the report 'lastUpdatedByPortalUserId' field to 'null'`, async () => {
      // Arrange
      const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

      saveSpy.mockResolvedValue(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await handleUtilisationReportPaymentAddedToFeeRecordEvent(RECONCILIATION_IN_PROGRESS_REPORT, { requestSource });

      // Assert
      expect(RECONCILIATION_IN_PROGRESS_REPORT.lastUpdatedByPortalUserId).toBe(null);
    });

    it(`sets the report 'lastUpdatedByTfmUserId' field to the request source user id`, async () => {
      // Arrange
      const RECONCILIATION_IN_PROGRESS_REPORT = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

      saveSpy.mockResolvedValue(RECONCILIATION_IN_PROGRESS_REPORT);

      // Act
      await handleUtilisationReportPaymentAddedToFeeRecordEvent(RECONCILIATION_IN_PROGRESS_REPORT, { requestSource });

      // Assert
      expect(RECONCILIATION_IN_PROGRESS_REPORT.lastUpdatedByTfmUserId).toBe(tfmUserId);
    });
  });
});
