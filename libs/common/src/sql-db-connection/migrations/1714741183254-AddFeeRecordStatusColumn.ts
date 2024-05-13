import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeRecordStatusColumn1714741183254 implements MigrationInterface {
  name = 'AddFeeRecordStatusColumn1714741183254';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "status" nvarchar(255) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "status"
        `);
  }
}
