import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUtilisationReportTable1706118619447 implements MigrationInterface {
  name = 'AddUtilisationReportTable1706118619447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "UtilisationReport" (
        "id" int NOT NULL IDENTITY(1, 1),
        "bankId" nvarchar(255) NOT NULL,
        "reportPeriodStartMonth" int NOT NULL,
        "reportPeriodStartYear" int NOT NULL,
        "reportPeriodEndMonth" int NOT NULL,
        "reportPeriodEndYear" int NOT NULL,
        "status" nvarchar(255) NOT NULL,
        "dateUploaded" datetime,
        "uploadedByUserId" varchar(255),
        CONSTRAINT "PK_98a789a9ebdc731bd04ec00860a" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "UtilisationReport"
    `);
  }
}
