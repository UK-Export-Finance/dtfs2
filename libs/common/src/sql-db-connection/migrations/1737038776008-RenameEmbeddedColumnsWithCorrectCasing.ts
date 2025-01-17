import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameEmbeddedColumnsWithCorrectCasing1737038776008 implements MigrationInterface {
  name = 'RenameEmbeddedColumnsWithCorrectCasing1737038776008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        EXEC sp_rename "[FeeRecordCorrection].[requestedByUserFirstname]", "requestedByUserFirstName", "COLUMN"
    `);

    await queryRunner.query(`
      EXEC sp_rename "[FeeRecordCorrection].[requestedByUserLastname]", "requestedByUserLastName", "COLUMN"
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        EXEC sp_rename "[FeeRecordCorrection].[requestedByUserFirstName]", "requestedByUserFirstname", "COLUMN"
    `);

    await queryRunner.query(`
      EXEC sp_rename "[FeeRecordCorrection].[requestedByUserLastName]", "requestedByUserLastname", "COLUMN"
  `);
  }
}
