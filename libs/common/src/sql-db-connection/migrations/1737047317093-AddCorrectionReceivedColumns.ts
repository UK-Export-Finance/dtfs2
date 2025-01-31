import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCorrectionReceivedColumns1737047317093 implements MigrationInterface {
  name = 'AddCorrectionReceivedColumns1737047317093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "dateReceived" datetime2
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "bankCommentary" nvarchar(500)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "previousFacilityId" nvarchar(10)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "previousFacilityUtilisation" decimal(14, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "previousFeesPaidToUkefForThePeriod" decimal(14, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "previousFeesPaidToUkefForThePeriodCurrency" nvarchar(255)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "correctedFacilityId" nvarchar(10)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "correctedFacilityUtilisation" decimal(14, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "correctedFeesPaidToUkefForThePeriod" decimal(14, 2)
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD "correctedFeesPaidToUkefForThePeriodCurrency" nvarchar(255)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "correctedFeesPaidToUkefForThePeriodCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "correctedFeesPaidToUkefForThePeriod"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "correctedFacilityUtilisation"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "correctedFacilityId"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "previousFeesPaidToUkefForThePeriodCurrency"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "previousFeesPaidToUkefForThePeriod"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "previousFacilityUtilisation"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "previousFacilityId"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "bankCommentary"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP COLUMN "dateReceived"
        `);
  }
}
