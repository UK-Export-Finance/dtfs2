import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUtilisationReportTables1712063692770 implements MigrationInterface {
  name = 'AddUtilisationReportTables1712063692770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "AzureFileInfo" (
                "id" int NOT NULL IDENTITY(1, 1),
                "folder" nvarchar(255) NOT NULL,
                "filename" nvarchar(255) NOT NULL,
                "fullPath" nvarchar(255) NOT NULL,
                "url" nvarchar(255) NOT NULL,
                "mimetype" nvarchar(255) NOT NULL,
                "utilisationReportId" int NOT NULL,
                "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_e2915e153159a656ef90279d58a" DEFAULT getdate(),
                "lastUpdatedByPortalUserId" nvarchar(255),
                "lastUpdatedByTfmUserId" nvarchar(255),
                "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_5b2813faa091ae4c63bc13a88ec" DEFAULT 0,
                CONSTRAINT "PK_ea6ad35b38f9b9e248b432d1a1e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "REL_4370b01aed42cea044ee2b1ce6" ON "AzureFileInfo" ("utilisationReportId")
            WHERE "utilisationReportId" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE TABLE "FeeRecord" (
                "id" int NOT NULL IDENTITY(1, 1),
                "facilityId" nvarchar(255) NOT NULL,
                "exporter" nvarchar(255) NOT NULL,
                "baseCurrency" nvarchar(255) NOT NULL,
                "facilityUtilisation" decimal(14, 2) NOT NULL,
                "totalFeesAccruedForThePeriod" decimal(14, 2) NOT NULL,
                "totalFeesAccruedForThePeriodCurrency" nvarchar(255) NOT NULL,
                "totalFeesAccruedForThePeriodExchangeRate" decimal(14, 8) NOT NULL,
                "feesPaidToUkefForThePeriod" decimal(14, 2) NOT NULL,
                "feesPaidToUkefForThePeriodCurrency" nvarchar(255) NOT NULL,
                "paymentCurrency" nvarchar(255) NOT NULL,
                "paymentExchangeRate" decimal(14, 8) NOT NULL,
                "reportId" int NOT NULL,
                "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_cec2cb2f5a2ccf4ac19cb938fd0" DEFAULT getdate(),
                "lastUpdatedByPortalUserId" nvarchar(255),
                "lastUpdatedByTfmUserId" nvarchar(255),
                "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_7121ac2f65fd8b070ffd591ed37" DEFAULT 0,
                CONSTRAINT "PK_9488afe4d9d39fec32e7c53d47a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "UtilisationReport" (
                "id" int NOT NULL IDENTITY(1, 1),
                "bankId" nvarchar(255) NOT NULL,
                "dateUploaded" datetime2,
                "status" nvarchar(255) NOT NULL,
                "uploadedByUserId" nvarchar(255),
                "reportPeriodStartMonth" int NOT NULL,
                "reportPeriodStartYear" int NOT NULL,
                "reportPeriodEndMonth" int NOT NULL,
                "reportPeriodEndYear" int NOT NULL,
                "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_268b233fa63b90c8ebda1bad341" DEFAULT getdate(),
                "lastUpdatedByPortalUserId" nvarchar(255),
                "lastUpdatedByTfmUserId" nvarchar(255),
                "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_edb079a13cd83e211bc24c2b0b9" DEFAULT 0,
                CONSTRAINT "PK_98a789a9ebdc731bd04ec00860a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f" FOREIGN KEY ("utilisationReportId") REFERENCES "UtilisationReport"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE "AzureFileInfo" DROP CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f"
        `);
    await queryRunner.query(`
            DROP TABLE "UtilisationReport"
        `);
    await queryRunner.query(`
            DROP TABLE "FeeRecord"
        `);
    await queryRunner.query(`
            DROP INDEX "REL_4370b01aed42cea044ee2b1ce6" ON "AzureFileInfo"
        `);
    await queryRunner.query(`
            DROP TABLE "AzureFileInfo"
        `);
  }
}
