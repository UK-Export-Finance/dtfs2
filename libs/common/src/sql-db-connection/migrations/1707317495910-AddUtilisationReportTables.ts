import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUtilisationReportTables1707317495910 implements MigrationInterface {
  name = 'AddUtilisationReportTables1707317495910';

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
        "createdDate" datetime2 NOT NULL CONSTRAINT "DF_417e7e60d2334feb8d0b6d9012c" DEFAULT getdate(),
        "updatedDate" datetime2 NOT NULL CONSTRAINT "DF_63516542816a60c7bb46d567347" DEFAULT getdate(),
        "updatedByUserId" nvarchar(255) NOT NULL,
        CONSTRAINT "PK_ea6ad35b38f9b9e248b432d1a1e" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "REL_4370b01aed42cea044ee2b1ce6" ON "AzureFileInfo" ("utilisationReportId")
      WHERE "utilisationReportId" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE TABLE "UtilisationReport" (
        "id" int NOT NULL IDENTITY(1, 1),
        "bankId" nvarchar(255) NOT NULL,
        "dateUploaded" datetime,
        "status" nvarchar(255) NOT NULL,
        "uploadedByUserId" varchar(255),
        "reportPeriodStartMonth" int NOT NULL,
        "reportPeriodStartYear" int NOT NULL,
        "reportPeriodEndMonth" int NOT NULL,
        "reportPeriodEndYear" int NOT NULL,
        "createdDate" datetime2 NOT NULL CONSTRAINT "DF_7950aca944f3cecb0b93ac0a5af" DEFAULT getdate(),
        "updatedDate" datetime2 NOT NULL CONSTRAINT "DF_5c45ce09cc23718185dd621914c" DEFAULT getdate(),
        "updatedByUserId" nvarchar(255) NOT NULL,
        CONSTRAINT "PK_98a789a9ebdc731bd04ec00860a" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "UtilisationData" (
        "id" int NOT NULL IDENTITY(1, 1),
        "facilityId" nvarchar(255) NOT NULL,
        "exporter" nvarchar(255) NOT NULL,
        "baseCurrency" nvarchar(255) NOT NULL,
        "facilityUtilisation" int NOT NULL,
        "totalFeesAccruedForTheMonth" int NOT NULL,
        "totalFeesAccruedForTheMonthCurrency" nvarchar(255) NOT NULL,
        "totalFeesAccruedForTheMonthExchangeRate" int NOT NULL,
        "monthlyFeesPaidToUkef" int NOT NULL,
        "monthlyFeesPaidToUkefCurrency" nvarchar(255) NOT NULL,
        "paymentCurrency" nvarchar(255) NOT NULL,
        "paymentExchangeRate" int NOT NULL,
        "reportId" int NOT NULL,
        "createdDate" datetime2 NOT NULL CONSTRAINT "DF_d3be25c51200bc4abc1b997efea" DEFAULT getdate(),
        "updatedDate" datetime2 NOT NULL CONSTRAINT "DF_a7cbc91fb5fec8b7a7a8d70bb3c" DEFAULT getdate(),
        "updatedByUserId" nvarchar(255) NOT NULL,
        CONSTRAINT "PK_01c6e8134a9c0b14202bdb796db" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "AzureFileInfo"
      ADD CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f" FOREIGN KEY ("utilisationReportId") REFERENCES "UtilisationReport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "UtilisationData"
      ADD CONSTRAINT "FK_07bb426ce8bebdfebd527650c15" FOREIGN KEY ("reportId") REFERENCES "UtilisationReport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "UtilisationData" DROP CONSTRAINT "FK_07bb426ce8bebdfebd527650c15"
    `);

    await queryRunner.query(`
      ALTER TABLE "AzureFileInfo" DROP CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f"
    `);

    await queryRunner.query(`
      DROP TABLE "UtilisationData"
    `);

    await queryRunner.query(`
      DROP TABLE "UtilisationReport"
    `);

    await queryRunner.query(`
      DROP INDEX "REL_4370b01aed42cea044ee2b1ce6" ON "AzureFileInfo"
    `);

    await queryRunner.query(`
      DROP TABLE "AzureFileInfo"
    `);
  }
}
