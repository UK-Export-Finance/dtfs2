import {
  FeeRecordStatus,
  UtilisationReportEntity,
  Currency,
  FeeRecordEntity,
  PaymentEntity,
  FacilityUtilisationDataEntity,
  FEE_RECORD_STATUS,
} from '@ukef/dtfs2-common';
import { DataSource } from 'typeorm';
import Big from 'big.js';
import { faker } from '@faker-js/faker';
import {
  createAutoMatchedZeroPaymentFeeRecordForReport,
  createRandomFeeRecordForReport,
  splitAmountIntoRandomAmounts,
} from './fee-record-payment-group.helpers';
import { MongoDbDataLoader } from '../mongo-db-client';

type AddRandomFeeRecordOverrides = {
  facilityId?: string;
  exporter?: string;
};

export class FeeRecordPaymentGroupSeeder {
  private readonly status: FeeRecordStatus;

  private readonly report: UtilisationReportEntity;

  private readonly paymentCurrency: Currency | null;

  private readonly feeRecords: FeeRecordEntity[] = [];

  private readonly reportIsManuallyReconciled: boolean = false;

  private constructor(report: UtilisationReportEntity, status: FeeRecordStatus, paymentCurrency: Currency | null, reportIsManuallyReconciled: boolean | null) {
    this.status = status;
    this.report = report;
    this.paymentCurrency = paymentCurrency;
    this.reportIsManuallyReconciled = reportIsManuallyReconciled ?? false;
  }

  public static forReportStatusAndPaymentCurrency(
    report: UtilisationReportEntity,
    status: Exclude<FeeRecordStatus, 'TO_DO'>,
    paymentCurrency: Currency,
  ): FeeRecordPaymentGroupSeeder {
    return new FeeRecordPaymentGroupSeeder(report, status, paymentCurrency, null);
  }

  public static forReport(report: UtilisationReportEntity): FeeRecordPaymentGroupSeeder {
    return new FeeRecordPaymentGroupSeeder(report, 'TO_DO', null, null);
  }

  public static forManuallyCompletedReport(report: UtilisationReportEntity): FeeRecordPaymentGroupSeeder {
    return new FeeRecordPaymentGroupSeeder(report, 'RECONCILED', null, true);
  }

  public addOneRandomFeeRecord(overrides: AddRandomFeeRecordOverrides = {}): FeeRecordPaymentGroupSeeder {
    if (!this.paymentCurrency) {
      const feeRecord = createRandomFeeRecordForReport(this.report, {
        ...overrides,
        status: this.status,
      });
      this.feeRecords.push(feeRecord);
      return this;
    }

    const feeRecord = createRandomFeeRecordForReport(this.report, {
      ...overrides,
      status: this.status,
      paymentCurrency: this.paymentCurrency,
    });
    this.feeRecords.push(feeRecord);
    return this;
  }

  public addManyRandomFeeRecords(numberOfFeeRecords: number, overrides: AddRandomFeeRecordOverrides = {}): FeeRecordPaymentGroupSeeder {
    let counter = 0;

    while (counter < numberOfFeeRecords) {
      this.addOneRandomFeeRecord(overrides);
      counter += 1;
    }
    return this;
  }

  public addAnAutoMatchedZeroPaymentFeeRecord(): FeeRecordPaymentGroupSeeder {
    const autoMatchedZeroPaymentFeeRecord = createAutoMatchedZeroPaymentFeeRecordForReport(this.report);
    this.feeRecords.push(autoMatchedZeroPaymentFeeRecord);
    return this;
  }

  private async saveFacilityUtilisationData(dataSource: DataSource): Promise<void> {
    for (const { facilityId, facilityUtilisation, report } of this.feeRecords) {
      const facilityUtilisationDataExists = await dataSource.manager.existsBy(FacilityUtilisationDataEntity, { id: facilityId });
      if (facilityUtilisationDataExists) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const facilityUtilisationData = new FacilityUtilisationDataEntity();
      facilityUtilisationData.id = facilityId;
      facilityUtilisationData.reportPeriod = report.reportPeriod;
      facilityUtilisationData.utilisation = facilityUtilisation * faker.number.float({ min: 0.8, max: 1.2 });
      facilityUtilisationData.updateLastUpdatedBy({ platform: 'SYSTEM' });
      await dataSource.manager.save(FacilityUtilisationDataEntity, facilityUtilisationData);
    }
  }

  public async save(dataSource: DataSource): Promise<void> {
    await this.saveFacilityUtilisationData(dataSource);

    if (!this.reportIsManuallyReconciled && this.status !== 'TO_DO') {
      throw new Error(`Cannot save fee records with status '${this.status}' when there are no payments`);
    }
    if (this.reportIsManuallyReconciled && this.status !== 'RECONCILED') {
      throw new Error(`Cannot save fee records with status '${this.status}' when report is manually reconciled`);
    }
    if (this.feeRecords.length === 0) {
      throw new Error('No fee records to save');
    }
    await dataSource.manager.save(FeeRecordEntity, this.feeRecords);
  }

  public async addPaymentsAndSave(numberOfPayments: number, dataSource: DataSource): Promise<void> {
    await this.saveFacilityUtilisationData(dataSource);

    if (this.status === FEE_RECORD_STATUS.TO_DO) {
      throw new Error("Cannot add payments to fee records with 'TO_DO' status");
    }
    if (!this.paymentCurrency) {
      throw new Error(`Cannot create payments without a payment currency`);
    }

    const totalFeesPaid = this.feeRecords
      .reduce((total, feeRecord) => total.add(feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency()), new Big(0))
      .toNumber();
    const paymentAmounts = splitAmountIntoRandomAmounts(totalFeesPaid, numberOfPayments);

    const mapAmountToPayment = (amount: number): PaymentEntity =>
      PaymentEntity.create({
        currency: this.paymentCurrency!,
        amount,
        dateReceived: faker.date.past({ years: 3 }),
        reference: faker.lorem.words({ min: 0, max: 3 }),
        feeRecords: this.feeRecords,
        requestSource: { platform: 'SYSTEM' },
      });

    if (this.status === FEE_RECORD_STATUS.DOES_NOT_MATCH) {
      const payments = paymentAmounts.map((amount) => Number((amount * 0.8).toFixed(2))).map(mapAmountToPayment);
      await dataSource.manager.save(PaymentEntity, payments);
      return;
    }

    if (this.status === FEE_RECORD_STATUS.RECONCILED && !this.reportIsManuallyReconciled) {
      const pdcReconcileUser = await MongoDbDataLoader.getPdcReconcileUserOrFail();
      for (const feeRecord of this.feeRecords) {
        feeRecord.updateLastUpdatedBy({ platform: 'TFM', userId: pdcReconcileUser._id.toString() });
        feeRecord.dateReconciled = faker.date.recent({ days: 15 });
        feeRecord.reconciledByUserId = pdcReconcileUser._id.toString();
      }
    }

    const payments = paymentAmounts.map(mapAmountToPayment);
    await dataSource.manager.save(PaymentEntity, payments);
  }
}
