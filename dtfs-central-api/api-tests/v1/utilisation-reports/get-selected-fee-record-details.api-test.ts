import { Response } from 'supertest';
import { Bank, FeeRecordEntityMockBuilder, SelectedFeeRecordDetails, SelectedFeeRecordsDetails, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import app from '../../../src/createApp';
import apiModule from '../../api';
import { SqlDbHelper } from '../../sql-db-helper';
import { wipe } from '../../wipeDB';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { aBank } from '../../../test-helpers/test-data/bank';
import { aReportPeriod } from '../../../test-helpers/test-data/report-period';

const api = apiModule(app);

const getUrl = (reportId: number | string) => `/v1/utilisation-reports/${reportId}/selected-fee-records-details`;

interface CustomResponse extends Response {
  body: SelectedFeeRecordDetails;
}

describe('GET /v1/utilisation-reports/:id/selected-fee-records-details', () => {
  const bankId = '123';
  const bank: Bank = { ...aBank(), id: bankId, name: 'Test bank' };

  const reportId = 1;

  const reportPeriod = aReportPeriod();
  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
    .withId(reportId)
    .withReportPeriod(reportPeriod)
    .withBankId(bankId)
    .build();
  const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(45)
    .withFacilityId('000123')
    .withExporter('Test company')
    .withFeesPaidToUkefForThePeriod(100)
    .withFeesPaidToUkefForThePeriodCurrency('GBP')
    .withPaymentCurrency('GBP')
    .build();
  const anotherFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(46)
    .withFacilityId('000123')
    .withExporter('Test company')
    .withFeesPaidToUkefForThePeriod(100)
    .withFeesPaidToUkefForThePeriodCurrency('GBP')
    .withPaymentCurrency('GBP')
    .build();
  utilisationReport.feeRecords = [feeRecord, anotherFeeRecord];

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.saveNewEntry('UtilisationReport', utilisationReport);

    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['banks']);
  });

  describe('GET /v1/utilisation-reports/:id/selected-fee-records-details', () => {
    it('returns 400 when an invalid report ID is provided', async () => {
      // Arrange
      const invalidReportId = 'invalid-id';

      // Act
      const response: CustomResponse = await api.get(getUrl(invalidReportId), { feeRecordIds: [45] });

      // Assert
      expect(response.status).toEqual(400);
    });

    it('gets selected fee record details', async () => {
      // Act
      const response: CustomResponse = await api.get(getUrl(reportId), { feeRecordIds: [45] });

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body).toEqual<SelectedFeeRecordsDetails>({
        reportPeriod,
        bank: {
          name: bank.name,
        },
        totalReportedPayments: { currency: 'GBP', amount: 100 },
        feeRecords: [
          {
            id: 45,
            facilityId: '000123',
            exporter: 'Test company',
            reportedFee: { currency: 'GBP', amount: 100 },
            reportedPayments: { currency: 'GBP', amount: 100 },
          },
        ],
        payments: [],
      });
    });
  });
});
