import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeleteCascadeToAzureFileInfo1709731032407 implements MigrationInterface {
  name = 'AddOnDeleteCascadeToAzureFileInfo1709731032407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "updatedByUserId" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData"
            ADD "updatedByUserId" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData" DROP COLUMN "baseCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData"
            ADD "baseCurrency" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData" DROP COLUMN "totalFeesAccruedForTheMonthCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData"
            ADD "totalFeesAccruedForTheMonthCurrency" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData" DROP COLUMN "monthlyFeesPaidToUkefCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData"
            ADD "monthlyFeesPaidToUkefCurrency" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData" DROP COLUMN "paymentCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData"
            ADD "paymentCurrency" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "updatedByUserId" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "status" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f" FOREIGN KEY ("utilisationReportId") REFERENCES "UtilisationReport"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "status" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "updatedByUserId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData" DROP COLUMN "paymentCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData"
            ADD "paymentCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData" DROP COLUMN "monthlyFeesPaidToUkefCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData"
            ADD "monthlyFeesPaidToUkefCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData" DROP COLUMN "totalFeesAccruedForTheMonthCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData"
            ADD "totalFeesAccruedForTheMonthCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData" DROP COLUMN "baseCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData"
            ADD "baseCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationData"
            ADD "updatedByUserId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "updatedByUserId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f" FOREIGN KEY ("utilisationReportId") REFERENCES "UtilisationReport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
