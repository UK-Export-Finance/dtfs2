import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentTable1716990167763 implements MigrationInterface {
  name = 'AddPaymentTable1716990167763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "Payment" (
                "id" int NOT NULL IDENTITY(1, 1),
                "currency" nvarchar(255) NOT NULL,
                "amountReceived" int NOT NULL,
                "dateReceived" datetime NOT NULL,
                "paymentReference" nvarchar(255),
                "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_3c7c91b94fc3c2cb358a90fa629" DEFAULT getdate(),
                "lastUpdatedByPortalUserId" nvarchar(255),
                "lastUpdatedByTfmUserId" nvarchar(255),
                "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_c095a0510351d4262872da05235" DEFAULT 0,
                CONSTRAINT "PK_07e9fb9a8751923eb876d57a575" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "fee_record_payments_payment" (
                "feeRecordId" int NOT NULL,
                "paymentId" int NOT NULL,
                CONSTRAINT "PK_b27631d6ebc4d310641d876f8a4" PRIMARY KEY ("feeRecordId", "paymentId")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_7a9b7aa849fc3bb09d80fa1f81" ON "fee_record_payments_payment" ("feeRecordId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_23bbb10be5f2136a5a5086654e" ON "fee_record_payments_payment" ("paymentId")
        `);
    await queryRunner.query(`
            ALTER TABLE "fee_record_payments_payment"
            ADD CONSTRAINT "FK_7a9b7aa849fc3bb09d80fa1f812" FOREIGN KEY ("feeRecordId") REFERENCES "FeeRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "fee_record_payments_payment"
            ADD CONSTRAINT "FK_23bbb10be5f2136a5a5086654e8" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "fee_record_payments_payment" DROP CONSTRAINT "FK_23bbb10be5f2136a5a5086654e8"
        `);
    await queryRunner.query(`
            ALTER TABLE "fee_record_payments_payment" DROP CONSTRAINT "FK_7a9b7aa849fc3bb09d80fa1f812"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_23bbb10be5f2136a5a5086654e" ON "fee_record_payments_payment"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_7a9b7aa849fc3bb09d80fa1f81" ON "fee_record_payments_payment"
        `);
    await queryRunner.query(`
            DROP TABLE "fee_record_payments_payment"
        `);
    await queryRunner.query(`
            DROP TABLE "Payment"
        `);
  }
}
