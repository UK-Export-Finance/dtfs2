import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNullableColumnTypes1710250937910 implements MigrationInterface {
  name = 'UpdateNullableColumnTypes1710250937910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP CONSTRAINT "FK_07bb426ce8bebdfebd527650c15"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "updatedByUserId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "updatedByUserId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "baseCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "baseCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "totalFeesAccruedForTheMonthCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "totalFeesAccruedForTheMonthCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "monthlyFeesPaidToUkefCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "monthlyFeesPaidToUkefCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "paymentCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "paymentCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "updatedByUserId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "dateUploaded"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "dateUploaded" datetime2
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "status" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "uploadedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "uploadedByUserId" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD CONSTRAINT "FK_f90d2441e5bee2fa7de081fdb21" FOREIGN KEY ("reportId") REFERENCES "UtilisationReport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP CONSTRAINT "FK_f90d2441e5bee2fa7de081fdb21"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "uploadedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "uploadedByUserId" varchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "status" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "dateUploaded"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "dateUploaded" datetime
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "UtilisationReport"
            ADD "updatedByUserId" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "paymentCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "paymentCurrency" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "monthlyFeesPaidToUkefCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "monthlyFeesPaidToUkefCurrency" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "totalFeesAccruedForTheMonthCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "totalFeesAccruedForTheMonthCurrency" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "baseCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "baseCurrency" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "updatedByUserId" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo" DROP COLUMN "updatedByUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "AzureFileInfo"
            ADD "updatedByUserId" varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD CONSTRAINT "FK_07bb426ce8bebdfebd527650c15" FOREIGN KEY ("reportId") REFERENCES "UtilisationReport"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
