import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { UPLOADED_REPORT_ID } from '../utilisation-report/utilisation-report.seed';
import { createFeeRecordForReportId } from './fee-record.helper';

export default class FeeRecordSeeder implements Seeder {
  /**
   * Track seeder execution.
   *
   * Default: true
   */
  track = true;

  public async run(dataSource: DataSource): Promise<void> {
    const feeRecordWithMatchingCurrencies = createFeeRecordForReportId(UPLOADED_REPORT_ID, {
      facilityId: '12345678',
      exporter: 'Test exporter',
      baseCurrency: 'GBP',
      facilityUtilisation: 1000000,
      totalFeesAccruedForThePeriod: 100,
      feesPaidToUkefForThePeriod: 50,
    });

    const feeRecordWithDifferingCurrencies = createFeeRecordForReportId(UPLOADED_REPORT_ID, {
      facilityId: '22345678',
      exporter: 'Test exporter 2',
      baseCurrency: 'GBP',
      facilityUtilisation: 200000,
      totalFeesAccruedForThePeriod: 150,
      feesPaidToUkefForThePeriod: 100,
      feesPaidToUkefForThePeriodCurrency: 'EUR',
      paymentCurrency: 'GBP',
      paymentExchangeRate: 1.1,
    });

    const feeRecordRepository = dataSource.getRepository(FeeRecordEntity);
    await feeRecordRepository.save([feeRecordWithMatchingCurrencies, feeRecordWithDifferingCurrencies]);
  }
}
