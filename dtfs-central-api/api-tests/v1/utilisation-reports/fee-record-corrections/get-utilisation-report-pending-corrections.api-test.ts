import { HttpStatusCode } from 'axios';
import {
  FEE_RECORD_STATUS,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  getNextReportPeriodForBankSchedule,
  RECONCILIATION_IN_PROGRESS,
  REPORT_NOT_RECEIVED,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';
import { wipe } from '../../../wipeDB';
import { aBank, aMonthlyBankReportPeriodSchedule, aPortalUser } from '../../../../test-helpers';
import { mongoDbClient } from '../../../../src/drivers/db-client';
import { PendingCorrectionsResponseBody } from '../../../../src/v1/controllers/utilisation-report-service/fee-record-correction/get-utilisation-report-pending-corrections.controller';

console.error = jest.fn();

const BASE_URL = '/v1/bank/:bankId/utilisation-reports/pending-corrections';

describe(`GET ${BASE_URL}`, () => {
  const bankId = '12345';

  const portalUser = {
    ...aPortalUser(),
    firstname: 'John',
    surname: 'Doe',
  };

  const portalUserId = portalUser._id.toString();

  const bank = {
    ...aBank(),
    id: bankId,
    isVisibleInTfmUtilisationReports: true,
    utilisationReportPeriodSchedule: aMonthlyBankReportPeriodSchedule(),
  };

  const expectAnyReportPeriod = {
    start: { month: expect.any(Number) as number, year: expect.any(Number) as number },
    end: { month: expect.any(Number) as number, year: expect.any(Number) as number },
  };

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await wipe(['users', 'banks']);

    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);
  });

  beforeEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  it(`should respond with a ${HttpStatusCode.BadRequest} if the bank id is not a number`, async () => {
    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId: 'not-a-number' }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it(`should respond with a ${HttpStatusCode.NotFound} if the bank does not exist`, async () => {
    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId: '56789' }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  describe('when there are no reports with pending corrections', () => {
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(1).withBankId(bankId).build();
    const completedCorrection = new FeeRecordCorrectionEntityMockBuilder().withIsCompleted(true).build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withStatus(FEE_RECORD_STATUS.TO_DO).withCorrections([completedCorrection]).build();
    report.feeRecords = [feeRecord];

    beforeEach(async () => {
      await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    });

    it(`should respond with ${HttpStatusCode.Ok}`, async () => {
      // Act
      const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId }));

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
    });

    it('should return an empty object', async () => {
      // Act
      const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId }));

      // Assert
      expect(response.body).toEqual({});
    });
  });

  describe('when there is one report with pending corrections', () => {
    const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
      .withId(1)
      .withBankId(bankId)
      .withUploadedByUserId(portalUserId)
      .withDateUploaded(new Date('2021-01-01'))
      .build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
      .withFacilityId('1122334455')
      .withExporter('Test Exporter')
      .build();
    const completedCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
      .withId(1)
      .withIsCompleted(true)
      .withAdditionalInfo('This correction has been completed')
      .build();
    const pendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
      .withId(2)
      .withIsCompleted(false)
      .withAdditionalInfo('This is some additional information')
      .build();

    feeRecord.corrections = [completedCorrection, pendingCorrection];
    report.feeRecords = [feeRecord];

    beforeEach(async () => {
      await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    });

    it(`should respond with ${HttpStatusCode.Ok}`, async () => {
      // Act
      const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId }));

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
    });

    it('should return the pending corrections details', async () => {
      // Act
      const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId }));

      // Assert
      expect(response.body).toEqual({
        reportId: report.id,
        reportPeriod: report.reportPeriod,
        uploadedByUserName: `${portalUser.firstname} ${portalUser.surname}`,
        dateUploaded: report.dateUploaded?.toISOString(),
        corrections: [
          {
            feeRecordId: feeRecord.id,
            facilityId: feeRecord.facilityId,
            exporter: feeRecord.exporter,
            additionalInfo: pendingCorrection.additionalInfo,
          },
        ],
        nextDueReportPeriod: expectAnyReportPeriod,
      });
    });

    describe('and when there are no due reports', () => {
      it('should return the next report period of the report period schedule that will be possible for upload as the nextDueReportPeriod', async () => {
        // Act
        const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId }));

        expect((response.body as PendingCorrectionsResponseBody).nextDueReportPeriod).toEqual(
          getNextReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule),
        );
      });
    });

    describe('and when there are due reports', () => {
      const oldestDueReport = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED)
        .withId(2)
        .withBankId(bankId)
        .withReportPeriod({ start: { month: 11, year: 2021 }, end: { month: 1, year: 2022 } })
        .build();

      const nextDueReport = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED)
        .withId(3)
        .withBankId(bankId)
        .withReportPeriod({ start: { month: 2, year: 2022 }, end: { month: 4, year: 2022 } })
        .build();

      beforeEach(async () => {
        await SqlDbHelper.saveNewEntries('UtilisationReport', [oldestDueReport, nextDueReport]);
      });

      it('should return the report period of the oldest due report as the nextDueReportPeriod', async () => {
        // Act
        const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId }));

        // Assert
        expect((response.body as PendingCorrectionsResponseBody).nextDueReportPeriod).toEqual(oldestDueReport.reportPeriod);
      });
    });
  });

  describe('when there are multiple reports with pending corrections', () => {
    const oldestReportWithPendingCorrections = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
      .withId(1)
      .withBankId(bankId)
      .withUploadedByUserId(portalUserId)
      .withDateUploaded(new Date('2022-01-01'))
      .withReportPeriod({ start: { month: 12, year: 2022 }, end: { month: 2, year: 2023 } })
      .build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(oldestReportWithPendingCorrections)
      .withId(1)
      .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
      .withFacilityId('1122334455')
      .withExporter('Test Exporter')
      .build();
    const pendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(feeRecord)
      .withId(1)
      .withIsCompleted(false)
      .withAdditionalInfo('This is the first correction to be made')
      .build();

    feeRecord.corrections = [pendingCorrection];
    oldestReportWithPendingCorrections.feeRecords = [feeRecord];

    const otherReportWithPendingCorrections = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
      .withId(2)
      .withBankId(bankId)
      .withUploadedByUserId(portalUserId)
      .withDateUploaded(new Date('2021-02-01'))
      .withReportPeriod({ start: { month: 3, year: 2023 }, end: { month: 5, year: 2023 } })
      .build();
    const otherFeeRecord = FeeRecordEntityMockBuilder.forReport(otherReportWithPendingCorrections)
      .withId(2)
      .withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION)
      .withFacilityId('5566778899')
      .withExporter('Another Test Exporter')
      .build();
    const otherPendingCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecord(otherFeeRecord)
      .withId(2)
      .withIsCompleted(false)
      .withAdditionalInfo('This is another correction that needs to be made')
      .build();

    otherFeeRecord.corrections = [otherPendingCorrection];
    otherReportWithPendingCorrections.feeRecords = [otherFeeRecord];

    beforeEach(async () => {
      await SqlDbHelper.saveNewEntries('UtilisationReport', [otherReportWithPendingCorrections, oldestReportWithPendingCorrections]);
    });

    it(`should respond with ${HttpStatusCode.Ok}`, async () => {
      // Act
      const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId }));

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
    });

    it('should return the pending corrections details for the oldest report with pending corrections', async () => {
      // Act
      const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId }));

      // Assert
      expect(response.body).toEqual({
        reportId: oldestReportWithPendingCorrections.id,
        reportPeriod: oldestReportWithPendingCorrections.reportPeriod,
        uploadedByUserName: `${portalUser.firstname} ${portalUser.surname}`,
        dateUploaded: oldestReportWithPendingCorrections.dateUploaded?.toISOString(),
        corrections: [
          {
            feeRecordId: feeRecord.id,
            facilityId: feeRecord.facilityId,
            exporter: feeRecord.exporter,
            additionalInfo: pendingCorrection.additionalInfo,
          },
        ],
        nextDueReportPeriod: expectAnyReportPeriod,
      });
    });
  });
});
