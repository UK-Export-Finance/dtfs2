import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFacilityUtilisationDataFixedFeeColumn1723453818266 implements MigrationInterface {
  name = 'AddFacilityUtilisationDataFixedFeeColumn1723453818266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FacilityUtilisationData"
            ADD "fixedFee" decimal(14, 2) NULL CONSTRAINT "DF_e4f3bdf7db7228fa36d4a6c9f4b" DEFAULT 0
        `);

    await queryRunner.query(`
            UPDATE "FacilityUtilisationData"
            SET "fixedFee" = 0 
        `);

    await queryRunner.query(`
            ALTER TABLE "FacilityUtilisationData"
            ALTER COLUMN "fixedFee" decimal(14, 2) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FacilityUtilisationData" DROP CONSTRAINT "DF_e4f3bdf7db7228fa36d4a6c9f4b"
        `);
    await queryRunner.query(`
            ALTER TABLE "FacilityUtilisationData" DROP COLUMN "fixedFee"
        `);
  }
}
