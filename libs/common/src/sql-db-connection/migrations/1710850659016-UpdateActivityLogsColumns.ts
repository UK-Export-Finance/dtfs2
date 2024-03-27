import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateActivityLogsColumns1710850659016 implements MigrationInterface {
  name = 'UpdateActivityLogsColumns1710850659016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP CONSTRAINT "DF_417e7e60d2334feb8d0b6d9012c"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "createdDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP CONSTRAINT "DF_63516542816a60c7bb46d567347"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "updatedDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP CONSTRAINT "DF_d3be25c51200bc4abc1b997efea"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "createdDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP CONSTRAINT "DF_a7cbc91fb5fec8b7a7a8d70bb3c"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "updatedDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP CONSTRAINT "DF_7950aca944f3cecb0b93ac0a5af"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "createdDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP CONSTRAINT "DF_5c45ce09cc23718185dd621914c"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "updatedDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_e2915e153159a656ef90279d58a" DEFAULT getdate()
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "lastUpdatedByPortalUserId" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "lastUpdatedByTfmUserId" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "lastUpdatedByIsSystemUser" bit NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_cec2cb2f5a2ccf4ac19cb938fd0" DEFAULT getdate()
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "lastUpdatedByPortalUserId" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "lastUpdatedByTfmUserId" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "lastUpdatedByIsSystemUser" bit NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_268b233fa63b90c8ebda1bad341" DEFAULT getdate()
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "lastUpdatedByPortalUserId" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "lastUpdatedByTfmUserId" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "lastUpdatedByIsSystemUser" bit NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "lastUpdatedByIsSystemUser"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "lastUpdatedByTfmUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "lastUpdatedByPortalUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP CONSTRAINT "DF_268b233fa63b90c8ebda1bad341"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "lastUpdatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "lastUpdatedByIsSystemUser"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "lastUpdatedByTfmUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "lastUpdatedByPortalUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP CONSTRAINT "DF_cec2cb2f5a2ccf4ac19cb938fd0"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "lastUpdatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "lastUpdatedByIsSystemUser"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "lastUpdatedByTfmUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "lastUpdatedByPortalUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP CONSTRAINT "DF_e2915e153159a656ef90279d58a"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "lastUpdatedAt"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "updatedByUserId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "updatedDate" datetime2 NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD CONSTRAINT "DF_5c45ce09cc23718185dd621914c" DEFAULT getdate() FOR "updatedDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "createdDate" datetime2 NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD CONSTRAINT "DF_7950aca944f3cecb0b93ac0a5af" DEFAULT getdate() FOR "createdDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "updatedByUserId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "updatedDate" datetime2 NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD CONSTRAINT "DF_a7cbc91fb5fec8b7a7a8d70bb3c" DEFAULT getdate() FOR "updatedDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "createdDate" datetime2 NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD CONSTRAINT "DF_d3be25c51200bc4abc1b997efea" DEFAULT getdate() FOR "createdDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "updatedByUserId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "updatedDate" datetime2 NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD CONSTRAINT "DF_63516542816a60c7bb46d567347" DEFAULT getdate() FOR "updatedDate"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "createdDate" datetime2 NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD CONSTRAINT "DF_417e7e60d2334feb8d0b6d9012c" DEFAULT getdate() FOR "createdDate"
        `);
  }
}
