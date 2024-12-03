import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableFeeRecordPaymentCascadeDelete1717618093262 implements MigrationInterface {
  name = 'EnableFeeRecordPaymentCascadeDelete1717618093262';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "fee_record_payments_payment" DROP CONSTRAINT "FK_23bbb10be5f2136a5a5086654e8"
        `);
    await queryRunner.query(`
            ALTER TABLE "fee_record_payments_payment"
            ADD CONSTRAINT "FK_23bbb10be5f2136a5a5086654e8" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "fee_record_payments_payment" DROP CONSTRAINT "FK_23bbb10be5f2136a5a5086654e8"
        `);
    await queryRunner.query(`
            ALTER TABLE "fee_record_payments_payment"
            ADD CONSTRAINT "FK_23bbb10be5f2136a5a5086654e8" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
