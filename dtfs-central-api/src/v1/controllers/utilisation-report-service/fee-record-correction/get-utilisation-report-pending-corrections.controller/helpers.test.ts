import {
  FEE_RECORD_STATUS,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  getNextReportPeriodForBankSchedule,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import {
  getNextDueReportPeriod,
  mapFeeRecordToPendingCorrectionsArray,
  mapFeeRecordsToPendingCorrections,
  mapReportToPendingCorrectionsResponseBody,
} from './helpers';
import { PendingCorrection } from '.';
import { aBank, aPortalUser } from '../../../../../../test-helpers';
import { getUserById } from '../../../../../repositories/users-repo';
import { UtilisationReportRepo } from '../../../../../repositories/utilisation-reports-repo';

jest.mock('../../../../../repositories/users-repo');
jest.mock('../../../../../repositories/utilisation-reports-repo');

describe('get-utilisation-report-pending-corrections.controller helpers', () => {
  describe('mapFeeRecordToPendingCorrectionsArray', () => {
    it(`should return an empty array if the fee record doesn't have any corrections`, () => {
      // Arrange
      const feeRecord = new FeeRecordEntityMockBuilder().withId(1).withFacilityId('FAC123').withExporter('Test Exporter').withCorrections([]).build();

      // Act
      const result = mapFeeRecordToPendingCorrectionsArray(feeRecord);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return an empty array if all the fee records corrections are completed', () => {
      // Arrange
      const feeRecord = new FeeRecordEntityMockBuilder()
        .withId(1)
        .withFacilityId('FAC123')
        .withExporter('Test Exporter')
        .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(true).build()])
        .build();

      // Act
      const result = mapFeeRecordToPendingCorrectionsArray(feeRecord);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return the pending corrections of the fee record mapped to the response field', () => {
      // Arrange
      const feeRecord = new FeeRecordEntityMockBuilder()
        .withId(1)
        .withFacilityId('FAC123')
        .withExporter('Test Exporter')
        .withCorrections([
          new FeeRecordCorrectionEntityMockBuilder().withId(1).withIsCompleted(false).withAdditionalInfo('Pending correction 1').build(),
          new FeeRecordCorrectionEntityMockBuilder().withId(2).withIsCompleted(true).withAdditionalInfo('Completed correction').build(),
          new FeeRecordCorrectionEntityMockBuilder().withId(3).withIsCompleted(false).withAdditionalInfo('Pending correction 2').build(),
        ])
        .build();

      // Act
      const result = mapFeeRecordToPendingCorrectionsArray(feeRecord);

      // Assert
      expect(result).toEqual<PendingCorrection[]>([
        {
          correctionId: 1,
          facilityId: 'FAC123',
          exporter: 'Test Exporter',
          additionalInfo: 'Pending correction 1',
        },
        {
          correctionId: 3,
          facilityId: 'FAC123',
          exporter: 'Test Exporter',
          additionalInfo: 'Pending correction 2',
        },
      ]);
    });
  });

  describe('mapFeeRecordsToPendingCorrections', () => {
    it('should return an empty array if there are no fee records', () => {
      // Arrange
      const feeRecords: FeeRecordEntity[] = [];

      // Act
      const result = mapFeeRecordsToPendingCorrections(feeRecords);

      // Assert
      expect(result).toEqual([]);
    });

    it(`should return an empty array if none of the fee records have status ${FEE_RECORD_STATUS.PENDING_CORRECTION}`, () => {
      // Arrange
      const statusesExludingPendingCorrection = Object.values(FEE_RECORD_STATUS).filter((status) => status !== FEE_RECORD_STATUS.PENDING_CORRECTION);
      const feeRecords = statusesExludingPendingCorrection.map((status) =>
        new FeeRecordEntityMockBuilder()
          .withStatus(status)
          .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(false).withAdditionalInfo('Pending correction 1').build()])
          .build(),
      );

      // Act
      const result = mapFeeRecordsToPendingCorrections(feeRecords);

      // Assert
      expect(result).toEqual([]);
    });

    it(`should return an empty array if none of the ${FEE_RECORD_STATUS.PENDING_CORRECTION} fee records have corrections`, () => {
      // Arrange
      const feeRecords = [
        new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).withCorrections([]).build(),
        new FeeRecordEntityMockBuilder().withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).withCorrections([]).build(),
      ];

      // Act
      const result = mapFeeRecordsToPendingCorrections(feeRecords);

      // Assert
      expect(result).toEqual([]);
    });

    it(`should return an empty array if all of the ${FEE_RECORD_STATUS.PENDING_CORRECTION} fee records' corrections are completed`, () => {
      // Arrange
      const feeRecords = [
        new FeeRecordEntityMockBuilder()
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(true).build()])
          .build(),
        new FeeRecordEntityMockBuilder()
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(true).build()])
          .build(),
      ];

      // Act
      const result = mapFeeRecordsToPendingCorrections(feeRecords);

      // Assert
      expect(result).toEqual([]);
    });

    it(`should return an array of all of the pending corrections of the fee records`, () => {
      // Arrange
      const feeRecords = [
        new FeeRecordEntityMockBuilder()
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withCorrections([
            new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(false).withAdditionalInfo('Pending correction 1').build(),
            new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(true).withAdditionalInfo('Completed correction').build(),
          ])
          .build(),
        new FeeRecordEntityMockBuilder()
          .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
          .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(false).withAdditionalInfo('Pending correction 2').build()])
          .build(),
      ];

      // Act
      const result = mapFeeRecordsToPendingCorrections(feeRecords);

      // Assert
      expect(result).toEqual<PendingCorrection[]>([
        ...mapFeeRecordToPendingCorrectionsArray(feeRecords[0]),
        ...mapFeeRecordToPendingCorrectionsArray(feeRecords[1]),
      ]);
    });
  });

  describe('getNextDueReportPeriod', () => {
    const bank = aBank();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should call fetch due reports by bank id', async () => {
      // Arrange
      const findDueReportsByBankIdSpy = jest.spyOn(UtilisationReportRepo, 'findDueReportsByBankId').mockResolvedValue([]);

      // Act
      await getNextDueReportPeriod(bank);

      // Assert
      expect(findDueReportsByBankIdSpy).toHaveBeenCalledWith(bank.id);
      expect(findDueReportsByBankIdSpy).toHaveBeenCalledWith(bank.id);
    });

    describe('when there are no due reports', () => {
      beforeEach(() => {
        jest.spyOn(UtilisationReportRepo, 'findDueReportsByBankId').mockResolvedValue([]);
      });

      it('should return the next report period in the bank schedule if there are no due reports', async () => {
        // Act
        const result = await getNextDueReportPeriod(bank);

        // Assert
        expect(result).toEqual(getNextReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule));
      });
    });

    describe('when there are due reports', () => {
      const dueReports = [
        new UtilisationReportEntityMockBuilder().withReportPeriod({ start: { month: 12, year: 2023 }, end: { month: 2, year: 2024 } }).build(),
        new UtilisationReportEntityMockBuilder().withReportPeriod({ start: { month: 3, year: 2024 }, end: { month: 5, year: 2024 } }).build(),
      ];

      beforeEach(() => {
        jest.spyOn(UtilisationReportRepo, 'findDueReportsByBankId').mockResolvedValue(dueReports);
      });

      it('should return the report period for the first returned not received report', async () => {
        // Act
        const result = await getNextDueReportPeriod(bank);

        // Assert
        expect(result).toEqual(dueReports[0].reportPeriod);
      });
    });
  });

  describe('mapReportToPendingCorrectionsResponseBody', () => {
    let report: UtilisationReportEntity;

    beforeEach(() => {
      jest.resetAllMocks();
      jest.spyOn(UtilisationReportRepo, 'findDueReportsByBankId').mockResolvedValue([]);
    });

    describe('when the report has no uploaded by user id', () => {
      beforeEach(() => {
        report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
          .withId(1)
          .withUploadedByUserId(null)
          .withDateUploaded(new Date())
          .build();
      });

      it('should throw an error', async () => {
        // Act & Assert
        await expect(mapReportToPendingCorrectionsResponseBody(report, aBank())).rejects.toThrow(
          new Error(`Report with id ${report.id} with pending corrections has not yet been uploaded.`),
        );
      });
    });

    describe('when the report has no date uploaded', () => {
      beforeEach(() => {
        report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
          .withId(1)
          .withUploadedByUserId('abc123')
          .withDateUploaded(null)
          .build();
      });

      it('should throw an error', async () => {
        // Act & Assert
        await expect(mapReportToPendingCorrectionsResponseBody(report, aBank())).rejects.toThrow(
          new Error(`Report with id ${report.id} with pending corrections has not yet been uploaded.`),
        );
      });
    });

    describe('when the report has been uploaded', () => {
      beforeEach(() => {
        report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
          .withId(1)
          .withReportPeriod({ start: { month: 1, year: 2021 }, end: { month: 3, year: 2021 } })
          .withUploadedByUserId('abc123')
          .withDateUploaded(new Date())
          .withFeeRecords([
            new FeeRecordEntityMockBuilder()
              .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
              .withCorrections([new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(false).build()])
              .build(),
          ])
          .build();
      });

      describe('and when finding the user errors', () => {
        const mockError = new Error('Could not fine user');

        beforeEach(() => {
          jest.mocked(getUserById).mockRejectedValue(mockError);
        });

        it('should rethrow the error', async () => {
          // Act & Assert
          await expect(mapReportToPendingCorrectionsResponseBody(report, aBank())).rejects.toThrow(mockError);
        });
      });

      describe('and when the user is found', () => {
        const user = { ...aPortalUser(), firstname: 'John', surname: 'Doe' };

        beforeEach(() => {
          jest.mocked(getUserById).mockResolvedValue(user);
        });

        it('should return the pending corrections response body', async () => {
          // Arrange
          const bank = aBank();

          // Act
          const result = await mapReportToPendingCorrectionsResponseBody(report, bank);

          // Assert
          expect(result).toEqual({
            reportPeriod: report.reportPeriod,
            uploadedByFullName: `${user.firstname} ${user.surname}`,
            dateUploaded: report.dateUploaded,
            reportId: report.id,
            corrections: mapFeeRecordsToPendingCorrections(report.feeRecords),
            nextDueReportPeriod: await getNextDueReportPeriod(bank),
          });
        });
      });
    });
  });
});
