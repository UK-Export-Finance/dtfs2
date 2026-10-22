import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeRecordCorrectionBankTeamNameAndEmailsColumns1738320805938 implements MigrationInterface {
  name = 'AddFeeRecordCorrectionBankTeamNameAndEmailsColumns1738320805938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "bankTeamName" nvarchar(500) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "bankTeamEmails" nvarchar(1000) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "bankTeamEmails"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "bankTeamName"
        `);
  }
}
