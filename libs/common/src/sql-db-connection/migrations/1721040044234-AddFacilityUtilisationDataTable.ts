import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFacilityUtilisationDataTable1721040044234 implements MigrationInterface {
  name = 'AddFacilityUtilisationDataTable1721040044234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "FacilityUtilisationData" (
                "id" nvarchar(10) NOT NULL,
                "utilisation" decimal(14, 2) NOT NULL CONSTRAINT "DF_4af84a919cb3a1ea143b4a93f00" DEFAULT 0,
                "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_5e17cd4417568f3be4c469c70cb" DEFAULT getdate(),
                "lastUpdatedByPortalUserId" nvarchar(255),
                "lastUpdatedByTfmUserId" nvarchar(255),
                "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_c394215c914eb1852c617c54bbb" DEFAULT 0,
                CONSTRAINT "PK_789e99214c8f2bf186c167d4dfa" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            INSERT INTO "FacilityUtilisationData" (id)
            SELECT DISTINCT "facilityId" FROM "FeeRecord"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ALTER COLUMN "facilityId" nvarchar(10) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ADD CONSTRAINT "FK_d5097b1143107c073cae23601f6" FOREIGN KEY ("facilityId") REFERENCES "FacilityUtilisationData"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecord" DROP CONSTRAINT "FK_d5097b1143107c073cae23601f6"
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ALTER COLUMN "facilityId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            DROP TABLE "FacilityUtilisationData"
        `);
  }
}
