import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeyingSheetColumns1720103206301 implements MigrationInterface {
  name = 'AddKeyingSheetColumns1720103206301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "fixedFeeAdjustment" decimal(14, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "premiumAccrualBalanceAdjustment" decimal(14, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "principalBalanceAdjustment" decimal(14, 2)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "principalBalanceAdjustment"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "premiumAccrualBalanceAdjustment"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "fixedFeeAdjustment"
        `);
  }
}
