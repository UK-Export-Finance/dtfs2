import { HttpStatusCode } from 'axios';
import { IsNull, Not } from 'typeorm';
import {
  AMENDMENT_STATUS,
  convertMillisecondsToSeconds,
  FacilityUtilisationDataEntity,
  FacilityUtilisationDataEntityMockBuilder,
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  FeeRecordPaymentJoinTableEntity,
  FeeRecordStatus,
  PaymentEntityMockBuilder,
  ReportPeriod,
  TfmFacility,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  UtilisationReportReconciliationStatus,
  withSqlIdPathParameterValidationTests,
} from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aPortalUser, aTfmUser, aTfmSessionUser, aTfmFacility, aFacility, aTfmFacilityAmendment } from '../../../test-helpers';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/keying-data';

describe(`POST ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string) => BASE_URL.replace(':reportId', reportId.toString());

  const reportId = 1;

  const portalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  const tfmUser = aTfmUser();
  const tfmUserId = tfmUser._id.toString();

  const anUploadedReconciliationInProgressUtilisationReport = () =>
    UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).withUploadedByUserId(portalUserId).build();
  const anUploadedPendingReconciliationUtilisationReport = () =>
    UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withId(reportId).withUploadedByUserId(portalUserId).build();

  const aValidRequestBody = () => ({
    user: {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    },
  });

  const insertTfmFacilityWithUkefFacilityId = async (...ukefFacilityIds: string[]): Promise<void> => {
    const tfmFacilitiesCollection = await mongoDbClient.getCollection('tfm-facilities');
    await tfmFacilitiesCollection.insertMany(
      ukefFacilityIds.map((ukefFacilityId) => ({
        ...aTfmFacility(),
        facilitySnapshot: {
          ...aFacility(),
          ukefFacilityId,
        },
      })),
    );
  };

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAll();

    await wipe(['users', 'tfm-users', 'tfm-facilities']);

    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);

    const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
    await tfmUsersCollection.insertOne(tfmUser);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAll();
    await wipe(['tfm-facilities']);
  });

  afterAll(async () => {
    await wipe(['users', 'tfm-users']);
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url: string) => testApi.post(aValidRequestBody()).to(url),
  });

  it("returns a 400 (Bad Request) when the payload 'user' is an empty object", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      user: {},
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it('returns a 404 (Not Found) when there are no fee records at the MATCH state attached to the report with the supplied id', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const toDoFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('TO_DO').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('TO_DO').build(),
    ];
    report.feeRecords = toDoFeeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    // Act
    const response = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it('returns a 200 (Ok) when request has a valid body and there are fee records at the MATCH status', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId('11111111').withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId('22222222').withStatus('MATCH').build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(feeRecords);

    await insertTfmFacilityWithUkefFacilityId('11111111', '22222222');

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it('returns a 200 when request has a valid body and the report is in state PENDING_RECONCILIATION with zero payment fee records at the MATCH status', async () => {
    // Arrange
    const report = anUploadedPendingReconciliationUtilisationReport();
    const facilityId = '11111111';
    report.feeRecords = [FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId(facilityId).withPayments([]).withStatus('MATCH').build()];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(report.feeRecords);

    await insertTfmFacilityWithUkefFacilityId(facilityId);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it('updates report status to RECONCILIATION_IN_PROGRESS when request has a valid body and the report is in state PENDING_RECONCILIATION with zero payment fee records at the MATCH status', async () => {
    // Arrange
    const report = anUploadedPendingReconciliationUtilisationReport();
    const facilityId = '11111111';
    report.feeRecords = [FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId(facilityId).withPayments([]).withStatus('MATCH').build()];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(report.feeRecords);

    await insertTfmFacilityWithUkefFacilityId(facilityId);

    const requestBody = aValidRequestBody();

    // Act
    await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    const updatedReport = await SqlDbHelper.manager.findOneByOrFail(UtilisationReportEntity, { id: reportId });
    expect(updatedReport.status).toBe<UtilisationReportReconciliationStatus>('RECONCILIATION_IN_PROGRESS');
  });

  it('updates the utilisation report audit fields', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const facilityId = '11111111';
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId(facilityId).withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId(facilityId).withStatus('MATCH').build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(feeRecords);

    await insertTfmFacilityWithUkefFacilityId(facilityId);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const updatedReport = await SqlDbHelper.manager.findOneByOrFail(UtilisationReportEntity, { id: reportId });
    expect(updatedReport.lastUpdatedByIsSystemUser).toEqual(false);
    expect(updatedReport.lastUpdatedByPortalUserId).toBeNull();
    expect(updatedReport.lastUpdatedByTfmUserId).toEqual(tfmUserId);
  });

  it('updates each of the MATCH fee record audit fields and does not update the non MATCH fee record audit fields', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const facilityId = '11111111';
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(1)
        .withFacilityId(facilityId)
        .withStatus('TO_DO')
        .withLastUpdatedByPortalUserId(portalUserId)
        .withLastUpdatedByTfmUserId(null)
        .withLastUpdatedByIsSystemUser(false)
        .build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId(facilityId).withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(3).withFacilityId(facilityId).withStatus('MATCH').build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(feeRecords);

    await insertTfmFacilityWithUkefFacilityId(facilityId);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const [notUpdatedFeeRecords, ...updatedFeeRecords] = await Promise.all([
      SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 1 }),
      SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 2 }),
      SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 3 }),
    ]);

    expect(notUpdatedFeeRecords.lastUpdatedByIsSystemUser).toEqual(false);
    expect(notUpdatedFeeRecords.lastUpdatedByPortalUserId).toEqual(portalUserId);
    expect(notUpdatedFeeRecords.lastUpdatedByTfmUserId).toBeNull();

    updatedFeeRecords.forEach((feeRecord) => {
      expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toEqual(tfmUserId);
    });
  });

  it('updates the status of all MATCH fee records to READY_TO_KEY', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const firstFacilityId = '11111111';
    const secondFacilityId = '22222222';
    const feeRecords = [
      // Fee records for same facility where only one has MATCH status
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId(firstFacilityId).withStatus('TO_DO').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId(firstFacilityId).withStatus('MATCH').build(),
      // Fee records for same facility where both have MATCH status
      FeeRecordEntityMockBuilder.forReport(report).withId(3).withFacilityId(secondFacilityId).withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(4).withFacilityId(secondFacilityId).withStatus('MATCH').build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(feeRecords);

    await insertTfmFacilityWithUkefFacilityId(firstFacilityId, secondFacilityId);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const allFeeRecords = await SqlDbHelper.manager.find(FeeRecordEntity, {});
    expect(allFeeRecords).toHaveLength(feeRecords.length);
    expect(allFeeRecords.find(({ id }) => id === 1)!.status).toBe<FeeRecordStatus>('TO_DO');
    expect(allFeeRecords.find(({ id }) => id === 2)!.status).toBe<FeeRecordStatus>('READY_TO_KEY');
    expect(allFeeRecords.find(({ id }) => id === 3)!.status).toBe<FeeRecordStatus>('READY_TO_KEY');
    expect(allFeeRecords.find(({ id }) => id === 4)!.status).toBe<FeeRecordStatus>('READY_TO_KEY');
  });

  it('populates the fee record payment join table paymentAmountUsedForFeeRecord column', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const firstFacilityId = '11111111';
    const feeRecords = [FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId(firstFacilityId).withStatus('MATCH').build()];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(feeRecords);

    await insertTfmFacilityWithUkefFacilityId(firstFacilityId);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const joinTableEntities = await SqlDbHelper.manager.find(FeeRecordPaymentJoinTableEntity, {});
    expect(joinTableEntities).toHaveLength(1);
    expect(joinTableEntities[0].feeRecordId).toEqual(1);
    expect(joinTableEntities[0].paymentId).toEqual(1);
    expect(joinTableEntities[0].paymentAmountUsedForFeeRecord).not.toBeNull();
  });

  it('calculates the new fixed fee using the effective amendment at the report period end', async () => {
    // Arrange
    const reportPeriod = { start: { month: 12, year: 2023 }, end: { month: 2, year: 2024 } };
    const dateWithinReportPeriod = new Date('2024-01-01');
    const dateAfterReportPeriodEnd = new Date('2024-03-01');
    const facilityId = '11111111';

    const tfmFacility: TfmFacility = {
      ...aTfmFacility(),
      facilitySnapshot: {
        ...aFacility(),
        ukefFacilityId: facilityId,
        dayCountBasis: 1,
        interestPercentage: 100,
        // 1095 days after report period end
        coverEndDate: new Date('2027-03-01'),
        coverPercentage: 80,
      },
      amendments: [
        {
          ...aTfmFacilityAmendment(),
          value: 350000,
          status: AMENDMENT_STATUS.COMPLETED,
          // Effective dates are stored in unix epoch time in seconds not milliseconds.
          effectiveDate: convertMillisecondsToSeconds(dateAfterReportPeriodEnd.getTime()),
          // 365 days after report period end
          coverEndDate: new Date('2025-03-01').getTime(),
        },
        {
          ...aTfmFacilityAmendment(),
          value: 300000,
          status: AMENDMENT_STATUS.COMPLETED,
          // Effective dates are stored in unix epoch time in seconds not milliseconds.
          effectiveDate: convertMillisecondsToSeconds(dateWithinReportPeriod.getTime()),
          // 730 days after report period end
          coverEndDate: new Date('2026-03-01').getTime(),
        },
      ],
    };

    const tfmFacilitiesCollection = await mongoDbClient.getCollection('tfm-facilities');
    await tfmFacilitiesCollection.insertOne(tfmFacility);

    const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
      .withId(reportId)
      .withReportPeriod(reportPeriod)
      .build();

    const utilisationData = FacilityUtilisationDataEntityMockBuilder.forId(facilityId).withFixedFee(1).build();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(1)
        .withFacilityId(facilityId)
        .withFacilityUtilisationData(utilisationData)
        .withStatus('MATCH')
        .withFacilityUtilisation(1)
        .build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    await insertMatchingPaymentsForFeeRecords(feeRecords);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const entities = await SqlDbHelper.manager.find(FacilityUtilisationDataEntity, {});
    expect(entities).toHaveLength(1);
    expect(entities[0].id).toEqual(facilityId);
    /**
     * The fixed fee is calculated as follows:
     * fixed fee = (utilisation * (coverPercentage / 100)) * bank fee adjustment * interest percentage * days left in cover period / day count basis
     *           = 1 * (80 / 100) *  0.9 * 100 / 100 * 730 / 1
     *           = 0.8 * 0.9 * 730
     *           = 657
     */
    expect(entities[0].fixedFee).toEqual(525.6);
  });

  it('calculates the ukef share of utilisation and saves to facility utilisation table', async () => {
    // Arrange
    const facilityId = '11111111';

    const tfmFacility: TfmFacility = {
      ...aTfmFacility(),
      facilitySnapshot: {
        ...aFacility(),
        ukefFacilityId: facilityId,
        coverPercentage: 80,
      },
    };

    const tfmFacilitiesCollection = await mongoDbClient.getCollection('tfm-facilities');
    await tfmFacilitiesCollection.insertOne(tfmFacility);

    const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS).withId(reportId).build();

    const utilisationData = FacilityUtilisationDataEntityMockBuilder.forId(facilityId).withUtilisation(100).build();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(1)
        .withFacilityId(facilityId)
        .withFacilityUtilisationData(utilisationData)
        .withStatus('MATCH')
        .withFacilityUtilisation(10000)
        .build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    await insertMatchingPaymentsForFeeRecords(feeRecords);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const entities = await SqlDbHelper.manager.find(FacilityUtilisationDataEntity, {});
    expect(entities).toHaveLength(1);
    expect(entities[0].id).toEqual(facilityId);
    /**
     * The utilisation is calculated as follows:
     * utilisation = reported utilisation * (coverPercentage / 100)
     *             = 10000 * (80 / 100)
     *             = 8000
     */
    expect(entities[0].utilisation).toEqual(8000);
  });

  describe('when there are multiple fee records with the same facility id', () => {
    const facilityId = '12345678';

    beforeEach(async () => {
      await insertTfmFacilityWithUkefFacilityId(facilityId);
    });

    const getReadyToKeyFeeRecordsWithNonNullKeyingData = async (): Promise<FeeRecordEntity[]> =>
      await SqlDbHelper.manager.find(FeeRecordEntity, {
        where: {
          status: 'READY_TO_KEY',
          fixedFeeAdjustment: Not(IsNull()),
          principalBalanceAdjustment: Not(IsNull()),
        },
      });

    const getReadyToKeyFeeRecordsWithNullKeyingData = async (): Promise<FeeRecordEntity[]> =>
      await SqlDbHelper.manager.find(FeeRecordEntity, {
        where: {
          status: 'READY_TO_KEY',
          fixedFeeAdjustment: IsNull(),
          principalBalanceAdjustment: IsNull(),
        },
      });

    it('generates keying data only for one of the fee records at MATCH status', async () => {
      // Arrange
      const report = anUploadedReconciliationInProgressUtilisationReport();

      const feeRecordsAtMatchStatus = [
        FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId(facilityId).withStatus('MATCH').build(),
        FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId(facilityId).withStatus('MATCH').build(),
        FeeRecordEntityMockBuilder.forReport(report).withId(3).withFacilityId(facilityId).withStatus('MATCH').build(),
      ];
      report.feeRecords = feeRecordsAtMatchStatus;
      await SqlDbHelper.saveNewEntry('UtilisationReport', report);
      await insertMatchingPaymentsForFeeRecords(feeRecordsAtMatchStatus);

      // Act
      const response1 = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

      // Assert
      expect(response1.status).toEqual(HttpStatusCode.Ok);
      expect(await getReadyToKeyFeeRecordsWithNullKeyingData()).toHaveLength(2);
      expect(await getReadyToKeyFeeRecordsWithNonNullKeyingData()).toHaveLength(1);
    });

    describe('and when the facility has already had keying data generated but there is still a fee record at the TO_DO status', () => {
      const toDoFeeRecordId = 12;
      const currentUtilisation = 1234567.89;
      const currentReportPeriod: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };

      const previousUtilisation = 9876543.21;
      const previousFixedFee = 6543.21;
      const previousReportPeriod: ReportPeriod = {
        start: { month: 12, year: 2023 },
        end: { month: 12, year: 2023 },
      };

      const assertFacilityUtilisationDataHasNotChanged = async () => {
        const facilityUtilisationData = await SqlDbHelper.manager.findOneByOrFail(FacilityUtilisationDataEntity, { id: facilityId });
        expect(facilityUtilisationData.fixedFee).toEqual(previousFixedFee);
        expect(facilityUtilisationData.utilisation).toEqual(previousUtilisation);
        expect(facilityUtilisationData.reportPeriod).toEqual(previousReportPeriod);
      };

      beforeEach(async () => {
        const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId(facilityId)
          .withReportPeriod(previousReportPeriod)
          .withFixedFee(previousFixedFee)
          .withUtilisation(previousUtilisation)
          .build();
        await SqlDbHelper.saveNewEntry('FacilityUtilisationData', facilityUtilisationData);

        const report = anUploadedReconciliationInProgressUtilisationReport();
        report.reportPeriod = currentReportPeriod;

        const toDoFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
          .withStatus('TO_DO')
          .withId(toDoFeeRecordId)
          .withFacilityUtilisation(currentUtilisation)
          .withFacilityId(facilityId)
          .build();

        const matchFeeRecords = [
          FeeRecordEntityMockBuilder.forReport(report)
            .withId(2)
            .withFacilityId(facilityId)
            .withFacilityUtilisation(currentUtilisation)
            .withStatus('MATCH')
            .build(),
          FeeRecordEntityMockBuilder.forReport(report)
            .withId(3)
            .withFacilityId(facilityId)
            .withFacilityUtilisation(currentUtilisation)
            .withStatus('MATCH')
            .build(),
        ];

        const feeRecordsForFacility = [toDoFeeRecord, ...matchFeeRecords];

        report.feeRecords = feeRecordsForFacility;
        await SqlDbHelper.saveNewEntry('UtilisationReport', report);
        await insertMatchingPaymentsForFeeRecords(matchFeeRecords);

        const response1 = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

        expect(response1.status).toEqual(HttpStatusCode.Ok);
        expect(await getReadyToKeyFeeRecordsWithNullKeyingData()).toHaveLength(2);
        expect(await getReadyToKeyFeeRecordsWithNonNullKeyingData()).toHaveLength(0);
        await assertFacilityUtilisationDataHasNotChanged();
      });

      it('generates keying data for the last facility fee record which has been moved to READY_TO_KEY', async () => {
        // Arrange
        const existingToDoFeeRecord = await SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: toDoFeeRecordId, status: 'TO_DO' });
        existingToDoFeeRecord.status = 'MATCH';
        await SqlDbHelper.saveNewEntry('FeeRecord', existingToDoFeeRecord);
        await insertMatchingPaymentsForFeeRecords([existingToDoFeeRecord]);

        // Act
        const response = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        expect(await getReadyToKeyFeeRecordsWithNullKeyingData()).toHaveLength(2);
        const feeRecordWithKeyingData = await getReadyToKeyFeeRecordsWithNonNullKeyingData();
        expect(feeRecordWithKeyingData).toHaveLength(1);
        expect(feeRecordWithKeyingData[0].id).toEqual(toDoFeeRecordId);
      });

      it('updates the facility utilisation data table once all fee records for the facility have been moved to READY_TO_KEY', async () => {
        // Arrange
        const existingToDoFeeRecord = await SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: toDoFeeRecordId, status: 'TO_DO' });
        existingToDoFeeRecord.status = 'MATCH';
        await SqlDbHelper.saveNewEntry('FeeRecord', existingToDoFeeRecord);
        await insertMatchingPaymentsForFeeRecords([existingToDoFeeRecord]);

        // Act
        const response = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        const facilityUtilisationData = await SqlDbHelper.manager.findOneByOrFail(FacilityUtilisationDataEntity, { id: facilityId });
        expect(facilityUtilisationData.utilisation).not.toEqual(previousUtilisation);
        expect(facilityUtilisationData.fixedFee).not.toEqual(previousFixedFee);
        expect(facilityUtilisationData.reportPeriod).toEqual(currentReportPeriod);
      });
    });

    describe('and when one of the fee records can be auto-reconciled', () => {
      it(`sets the fee record status to ${FEE_RECORD_STATUS.RECONCILED} and sets the dateReconciled field`, async () => {
        // Arrange
        const report = anUploadedReconciliationInProgressUtilisationReport();

        const feeRecordToAutoReconcile = FeeRecordEntityMockBuilder.forReport(report)
          .withId(12)
          .withFeesPaidToUkefForThePeriod(0)
          .withStatus(FEE_RECORD_STATUS.MATCH)
          .build();
        const toDoFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(24).withStatus(FEE_RECORD_STATUS.TO_DO).build();

        report.feeRecords = [feeRecordToAutoReconcile, toDoFeeRecord];
        await SqlDbHelper.saveNewEntry('UtilisationReport', report);

        // Act
        const response = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);

        const modifiedFeeRecord = await SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 12 });
        expect(modifiedFeeRecord.status).toEqual(FEE_RECORD_STATUS.RECONCILED);
        expect(modifiedFeeRecord.dateReconciled).not.toBeNull();
      });
    });
  });

  async function insertMatchingPaymentsForFeeRecords(feeRecordEntities: FeeRecordEntity[]): Promise<void> {
    let paymentId = 0;
    const payments = feeRecordEntities.map((feeRecord) => {
      paymentId += 1;
      const paymentAmount = feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency();
      return PaymentEntityMockBuilder.forCurrency(feeRecord.paymentCurrency).withId(paymentId).withAmount(paymentAmount).withFeeRecords([feeRecord]).build();
    });
    await SqlDbHelper.saveNewEntries('Payment', payments);
  }
});
