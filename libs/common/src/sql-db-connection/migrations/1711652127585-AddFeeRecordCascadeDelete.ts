import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeRecordCascadeDelete1711652127585 implements MigrationInterface {
  name = 'AddFeeRecordCascadeDelete1711652127585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP CONSTRAINT "FK_f90d2441e5bee2fa7de081fdb21"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD CONSTRAINT "FK_f90d2441e5bee2fa7de081fdb21" FOREIGN KEY ("reportId") REFERENCES "UtilisationReport"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP CONSTRAINT "FK_f90d2441e5bee2fa7de081fdb21"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD CONSTRAINT "FK_f90d2441e5bee2fa7de081fdb21" FOREIGN KEY ("reportId") REFERENCES "UtilisationReport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
