import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeRecordStatusColumn1715613302494 implements MigrationInterface {
  name = 'AddFeeRecordStatusColumn1715613302494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "status" nvarchar(255) NULL CONSTRAINT "DF_1eb3a649cce84deaa2a20390401" DEFAULT 'TO_DO'
        `);
    await queryRunner.query(`
            UPDATE "FeeRecord"
            SET "status" = 'TO_DO'
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ALTER COLUMN "status" nvarchar(255) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP CONSTRAINT "DF_1eb3a649cce84deaa2a20390401"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "status"
        `);
  }
}
