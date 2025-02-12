import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropFeeRecordFacilityUtilisationDataFacilityIdFK1739352451739 implements MigrationInterface {
  name = 'DropFeeRecordFacilityUtilisationDataFacilityIdFK1739352451739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP CONSTRAINT "FK_d5097b1143107c073cae23601f6"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD CONSTRAINT "FK_d5097b1143107c073cae23601f6" FOREIGN KEY ("facilityId") REFERENCES "FacilityUtilisationData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
