import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  FeeRecordStatus,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  UtilisationReportReconciliationStatus,
} from '@ukef/dtfs2-common';
import { difference } from 'lodash';
import { mapReportToSummaryItem } from './reconciliation-summary-item-mapper';
import { aBank } from '../../../../../../test-helpers';

describe('reconciliation-summary-item-mapper', () => {
  describe('mapReportToSummaryItem', () => {
    it('sets the total facilities reported to the count of distinct facility ids in the reports fee records', () => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();
      const aFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('1111').build();
      const aFeeRecordWithTheSameFacilityId = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('1111').build();
      const aFeeRecordWithADifferentFacilityId = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('2222').build();
      report.feeRecords = [aFeeRecord, aFeeRecordWithTheSameFacilityId, aFeeRecordWithADifferentFacilityId];

      // Act
      const summaryItem = mapReportToSummaryItem(aBank(), report);

      // Assert
      expect(summaryItem.totalFacilitiesReported).toEqual(2);
    });

    it('sets the total fees reported to the count of fee records attached to the report', () => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();
      const aFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('1111').build();
      const anotherFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('1111').build();
      const oneMoreFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('2222').build();
      report.feeRecords = [aFeeRecord, anotherFeeRecord, oneMoreFeeRecord];

      // Act
      const summaryItem = mapReportToSummaryItem(aBank(), report);

      // Assert
      expect(summaryItem.totalFeesReported).toEqual(3);
    });

    it('does not count reconciled fee records in the reported fees left to reconcile', () => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();
      const aNotYetReconciledFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('1111').withStatus(FEE_RECORD_STATUS.READY_TO_KEY).build();
      const anotherNotYetReconciledFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
        .withFacilityId('5555')
        .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
        .build();
      const aReconciledFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('1111').withStatus(FEE_RECORD_STATUS.RECONCILED).build();
      const anotherReconciledFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('2222').withStatus(FEE_RECORD_STATUS.RECONCILED).build();
      report.feeRecords = [aNotYetReconciledFeeRecord, anotherNotYetReconciledFeeRecord, aReconciledFeeRecord, anotherReconciledFeeRecord];

      // Act
      const summaryItem = mapReportToSummaryItem(aBank(), report);

      // Assert
      expect(summaryItem.reportedFeesLeftToReconcile).toEqual(2);
    });

    it.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.RECONCILED]))(
      'counts fee records with status %s in the reported fees left to reconcile',
      (status: FeeRecordStatus) => {
        // Arrange
        const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION).build();
        const aNotYetReconciledFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('1111').withStatus(status).build();
        report.feeRecords = [aNotYetReconciledFeeRecord];

        // Act
        const summaryItem = mapReportToSummaryItem(aBank(), report);

        // Assert
        expect(summaryItem.reportedFeesLeftToReconcile).toEqual(1);
      },
    );

    it('sets the reported fees left to reconcile to zero if the report is reconciled but not all fee records are', () => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED).withFeeRecords([]).build();
      const aNotReconciledFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withFacilityId('1111').withStatus(FEE_RECORD_STATUS.TO_DO).build();
      report.feeRecords = [aNotReconciledFeeRecord];

      // Act
      const summaryItem = mapReportToSummaryItem(aBank(), report);

      // Assert
      expect(summaryItem.reportedFeesLeftToReconcile).toEqual(0);
    });

    it('does not set the reconciliation summary count fields if the report has not yet been received', () => {
      // Arrange
      const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED).withFeeRecords([]).build();

      // Act
      const summaryItem = mapReportToSummaryItem(aBank(), report);

      // Assert
      expect(summaryItem.totalFacilitiesReported).toBeUndefined();
      expect(summaryItem.totalFeesReported).toBeUndefined();
      expect(summaryItem.reportedFeesLeftToReconcile).toBeUndefined();
    });

    it.each(difference(Object.values(UTILISATION_REPORT_RECONCILIATION_STATUS), [UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED]))(
      'sets the reconciliation summary count fields if the report has has status %s',
      (status: UtilisationReportReconciliationStatus) => {
        // Arrange
        const report = UtilisationReportEntityMockBuilder.forStatus(status).withFeeRecords([]).build();

        // Act
        const summaryItem = mapReportToSummaryItem(aBank(), report);

        // Assert
        expect(summaryItem.totalFacilitiesReported).toBeDefined();
        expect(summaryItem.totalFeesReported).toBeDefined();
        expect(summaryItem.reportedFeesLeftToReconcile).toBeDefined();
      },
    );
  });
});
