import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFeeRecordColumns1710259065447 implements MigrationInterface {
  name = 'UpdateFeeRecordColumns1710259065447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "totalFeesAccruedForTheMonth"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "totalFeesAccruedForTheMonthExchangeRate"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "monthlyFeesPaidToUkef"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "totalFeesAccruedForTheMonthCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "monthlyFeesPaidToUkefCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "totalFeesAccruedForThePeriod" decimal(14, 2) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "totalFeesAccruedForThePeriodCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "totalFeesAccruedForThePeriodExchangeRate" decimal(14, 8) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "feesPaidToUkefForThePeriod" decimal(14, 2) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "feesPaidToUkefForThePeriodCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "facilityUtilisation"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "facilityUtilisation" decimal(14, 2) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "paymentExchangeRate"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "paymentExchangeRate" decimal(14, 8) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "paymentExchangeRate"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "paymentExchangeRate" int NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "facilityUtilisation"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "facilityUtilisation" int NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "feesPaidToUkefForThePeriodCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "feesPaidToUkefForThePeriod"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "totalFeesAccruedForThePeriodExchangeRate"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "totalFeesAccruedForThePeriodCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP COLUMN "totalFeesAccruedForThePeriod"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "monthlyFeesPaidToUkefCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "totalFeesAccruedForTheMonthCurrency" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "monthlyFeesPaidToUkef" int NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "totalFeesAccruedForTheMonthExchangeRate" int NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD "totalFeesAccruedForTheMonth" int NOT NULL
        `);
  }
}
