import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentTableUpdateAmountColumns1717746522387 implements MigrationInterface {
  name = 'PaymentTableUpdateAmountColumns1717746522387';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            EXEC sp_rename "[Payment].[amountReceived]", "amount", "COLUMN"
        `);

    await queryRunner.query(`
            ALTER TABLE "Payment"
            ALTER COLUMN "amount" decimal(14, 2) NOT NULL
        `);

    await queryRunner.query(`
            EXEC sp_rename "[Payment].[paymentReference]", "reference", "COLUMN"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            EXEC sp_rename "[Payment].[amount]", "amountReceived", "COLUMN"
        `);

    await queryRunner.query(`
            ALTER TABLE "Payment"
            ALTER COLUMN "amount" int NOT NULL
        `);

    await queryRunner.query(`
            EXEC sp_rename "[Payment].[reference]", "paymentReference", "COLUMN"
        `);
  }
}
