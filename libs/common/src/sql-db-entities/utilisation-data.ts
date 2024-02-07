import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisationReportEntity } from './utilisation-report';
import { Currency } from '../types';
import { AuditableEntity } from './base-entities';

// TODO FN-2183 - should this name maybe refer to `payments`, `feeRecords`, or something else?
@Entity('UtilisationData')
export class UtilisationDataEntity extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The `_id` of the associated facility in the 'facilities' MongoDB collection
   */
  @Column()
  facilityId!: string;

  /**
   * The associated report from the UtilisationReport table
   */
  @ManyToOne(() => UtilisationReportEntity, (report) => report.data, {
    nullable: false,
  })
  report!: UtilisationReportEntity;

  /**
   * Name of the exporter that the GEF is on behalf of
   */
  @Column()
  exporter!: string;

  /**
   * Currency of the facility that the fee record is for
   */
  @Column()
  baseCurrency!: Currency;

  /**
   * The current utilisation (drawdown) of the facility by the exporter
   */
  @Column()
  facilityUtilisation!: number;

  /**
   * Total amount of money accrued by UKEF for the GEF
   */
  @Column()
  totalFeesAccruedForTheMonth!: number;

  /**
   * The currency of the total amount of money accrued by UKEF for the GEF
   */
  @Column()
  totalFeesAccruedForTheMonthCurrency!: Currency;

  /**
   * The exchange rate from the `baseCurrency` to the `totalFeesAccruedForTheMonthCurrency`
   */
  @Column()
  totalFeesAccruedForTheMonthExchangeRate!: number;

  /**
   * The fees actually paid to UKEF by the bank
   */
  @Column()
  monthlyFeesPaidToUkef!: number;

  /**
   * The currency of the fees actually paid to UKEF by the bank
   */
  @Column()
  monthlyFeesPaidToUkefCurrency!: Currency;

  /**
   * The currency of the payment made to UKEF by the bank
   */
  @Column()
  paymentCurrency!: Currency;

  /**
   * The exchange rate from the `baseCurrency` to the `paymentCurrency`
   */
  @Column()
  paymentExchangeRate!: number;
}
