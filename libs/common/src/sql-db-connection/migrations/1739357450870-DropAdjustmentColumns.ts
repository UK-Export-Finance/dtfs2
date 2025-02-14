import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropAdjustmentColumns1739357450870 implements MigrationInterface {
  name = 'DropAdjustmentColumns1739357450870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "fixedFeeAdjustment"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "principalBalanceAdjustment"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "principalBalanceAdjustment" decimal(14, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "fixedFeeAdjustment" decimal(14, 2)
        `);
  }
}
