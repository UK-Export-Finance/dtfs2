import { HttpStatusCode } from 'axios';
import {
  Bank,
  FEE_RECORD_STATUS,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  RECORD_CORRECTION_REASON,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../../test-api';
import { SqlDbHelper } from '../../../sql-db-helper';
import { aBank } from '../../../../test-helpers';
import { mongoDbClient } from '../../../../src/drivers/db-client';
import { wipe } from '../../../wipeDB';
import { replaceUrlParameterPlaceholders } from '../../../../test-helpers/replace-url-parameter-placeholders';

console.error = jest.fn();

const BASE_URL = '/v1/banks/:bankId/utilisation-reports/completed-corrections';

describe(`GET ${BASE_URL}`, () => {
  const bankId = '123';
  const bank: Bank = {
    ...aBank(),
    id: bankId,
  };

  const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withBankId(bankId).build();
  const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withExporter('An exporter').withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED).build();
  report.feeRecords = [feeRecord];

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);

    await SqlDbHelper.saveNewEntries('UtilisationReport', [report]);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('FeeRecordCorrection');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['banks']);
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.get(url),
  });

  it(`should return '${HttpStatusCode.Ok}' and the completed fee record corrections response`, async () => {
    // Arrange
    const dateCorrectionReceived = new Date('2024-01-01');
    const oldFacilityId = feeRecord.facilityId;
    const newFacilityId = '12345678';

    const feeRecordCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, true)
      .withId(1)
      .withDateReceived(dateCorrectionReceived)
      .withReasons([RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER])
      .withPreviousValues({
        facilityId: oldFacilityId,
      })
      .withCorrectedValues({
        facilityId: newFacilityId,
      })
      .withBankCommentary('Some bank commentary')
      .build();

    await SqlDbHelper.saveNewEntry('FeeRecordCorrection', feeRecordCorrection);

    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const expectedMappedCompletedCorrections = [
      {
        id: feeRecordCorrection.id,
        dateSent: dateCorrectionReceived.toISOString(),
        exporter: feeRecord.exporter,
        formattedReasons: 'Facility ID is incorrect, Other',
        formattedPreviousValues: `${oldFacilityId}, -`,
        formattedCorrectedValues: `${newFacilityId}, -`,
        bankCommentary: feeRecordCorrection.bankCommentary,
      },
    ];

    expect(response.body).toEqual(expectedMappedCompletedCorrections);
  });

  it(`should return '${HttpStatusCode.NotFound}' when no completed fee record corrections with the supplied bank id can be found`, async () => {
    // Arrange
    const feeRecordCorrection = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, true).build();

    await SqlDbHelper.saveNewEntry('FeeRecordCorrection', feeRecordCorrection);

    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { bankId: `${bankId}123` }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });
});
