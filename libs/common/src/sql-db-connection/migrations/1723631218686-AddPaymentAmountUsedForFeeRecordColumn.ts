import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentAmountUsedForFeeRecordColumn1723631218686 implements MigrationInterface {
  name = 'AddPaymentAmountUsedForFeeRecordColumn1723631218686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "fee_record_payments_payment"
            ADD "paymentAmountUsedForFeeRecord" decimal(14, 2)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "fee_record_payments_payment" DROP COLUMN "paymentAmountUsedForFeeRecord"
        `);
  }
}
