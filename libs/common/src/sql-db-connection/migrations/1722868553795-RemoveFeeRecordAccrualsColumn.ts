import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveFeeRecordAccrualsColumn1722868553795 implements MigrationInterface {
  name = 'RemoveFeeRecordAccrualsColumn1722868553795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "premiumAccrualBalanceAdjustment"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "premiumAccrualBalanceAdjustment" decimal(14, 2)
        `);
  }
}
