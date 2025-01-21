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
import { mapFeeRecordEntityToReportedFees } from '../../../../src/mapping/fee-record-mapper';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/fee-record-corrections/:correctionId';

describe(`GET ${BASE_URL}`, () => {
  const correctionId = 7;

  const bankId = '123';
  const bank: Bank = {
    ...aBank(),
    id: bankId,
  };

  const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withBankId(bankId).build();
  const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withStatus(FEE_RECORD_STATUS.PENDING_CORRECTION).build();
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

  it(`should return '${HttpStatusCode.Ok}' and the fee record correction response`, async () => {
    // Arrange
    const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false)
      .withId(correctionId)
      .withReasons([RECORD_CORRECTION_REASON.OTHER])
      .withAdditionalInfo('Some additional information')
      .build();

    await SqlDbHelper.saveNewEntry('FeeRecordCorrection', feeRecordCorrectionEntity);

    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { correctionId }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    expect(response.body).toEqual({
      id: correctionId,
      bankId,
      facilityId: feeRecord.facilityId,
      exporter: feeRecord.exporter,
      reportedFees: mapFeeRecordEntityToReportedFees(feeRecord),
      reasons: feeRecordCorrectionEntity.reasons,
      additionalInfo: feeRecordCorrectionEntity.additionalInfo,
    });
  });

  it(`should return '${HttpStatusCode.NotFound}' when no fee record correction with the supplied id can be found`, async () => {
    // Arrange
    const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(feeRecord, false).withId(correctionId).build();

    await SqlDbHelper.saveNewEntry('FeeRecordCorrection', feeRecordCorrectionEntity);

    // Act
    const response = await testApi.get(replaceUrlParameterPlaceholders(BASE_URL, { correctionId: correctionId + 1 }));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });
});
