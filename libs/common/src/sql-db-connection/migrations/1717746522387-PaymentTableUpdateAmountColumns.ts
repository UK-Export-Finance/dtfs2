import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * This migration has been manually modified in order to work
 * with ledger tables.
 */
export class PaymentTableUpdateAmountColumns1717746522387 implements MigrationInterface {
  name = 'PaymentTableUpdateAmountColumns1717746522387';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the new columns with the required data-type and set to nullable
    await queryRunner.query(`
            ALTER TABLE "Payment"
            ADD "amount" decimal(14, 2) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "Payment"
            ADD "reference" nvarchar(255) NULL
        `);

    // Copy all the values from the old columns to the new columns
    await queryRunner.query(`
            UPDATE "Payment" SET "amount" = "amountReceived"
        `);
    await queryRunner.query(`
            UPDATE "Payment" SET "reference" = "paymentReference"
        `);

    // Delete the old columns
    await queryRunner.query(`
            ALTER TABLE "Payment"
            DROP COLUMN "amountReceived"
        `);
    await queryRunner.query(`
            ALTER TABLE "Payment"
            DROP COLUMN "paymentReference"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Create the new columns with the required data-type and set to nullable
    await queryRunner.query(`
            ALTER TABLE "Payment"
            ADD "amountReceived" int NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "Payment"
            ADD "paymentReference" nvarchar(255) NULL
        `);

    // Copy all the values from the old columns to the new columns
    await queryRunner.query(`
            UPDATE "Payment" SET "amountReceived" = "amount"
        `);
    await queryRunner.query(`
            UPDATE "Payment" SET "paymentReference" = "reference"
        `);

    // Delete the old columns
    await queryRunner.query(`
            ALTER TABLE "Payment"
            DROP COLUMN "amount"
        `);
    await queryRunner.query(`
            ALTER TABLE "Payment"
            DROP COLUMN "reference"
        `);
  }
}
