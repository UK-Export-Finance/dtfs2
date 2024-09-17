import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeRecordReconciliationDataColumns1724342914301 implements MigrationInterface {
  name = 'AddFeeRecordReconciliationDataColumns1724342914301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "reconciledByUserId" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "dateReconciled" datetime2
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "dateReconciled"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "reconciledByUserId"
        `);
  }
}
