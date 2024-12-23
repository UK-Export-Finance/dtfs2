import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameFeeRecordCorrectionRequestTransientFormDataTable1734541846660 implements MigrationInterface {
  name = 'RenameFeeRecordCorrectionRequestTransientFormDataTable1734541846660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            EXEC sp_rename "FeeRecordCorrectionTransientFormData", "FeeRecordCorrectionRequestTransientFormData";
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            EXEC sp_rename "FeeRecordCorrectionRequestTransientFormData", "FeeRecordCorrectionTransientFormData";
        `);
  }
}
