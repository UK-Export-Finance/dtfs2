import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUtilisationDataToFeeRecord1710248062308 implements MigrationInterface {
  name = 'RenameUtilisationDataToFeeRecord1710248062308';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`exec sp_rename "[DTFS].[dbo].[UtilisationData]", "FeeRecord"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`exec sp_rename "[DTFS].[dbo].[FeeRecord]", "UtilisationData"`);
  }
}
