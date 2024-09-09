import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFacilityUtilisationDataTable1721227404776 implements MigrationInterface {
  name = 'AddFacilityUtilisationDataTable1721227404776';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "FacilityUtilisationData" (
                "id" nvarchar(10) NOT NULL,
                "utilisation" decimal(14, 2) NOT NULL CONSTRAINT "DF_4af84a919cb3a1ea143b4a93f00" DEFAULT 0,
                "reportPeriodStartMonth" int NOT NULL,
                "reportPeriodStartYear" int NOT NULL,
                "reportPeriodEndMonth" int NOT NULL,
                "reportPeriodEndYear" int NOT NULL,
                "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_5e17cd4417568f3be4c469c70cb" DEFAULT getdate(),
                "lastUpdatedByPortalUserId" nvarchar(255),
                "lastUpdatedByTfmUserId" nvarchar(255),
                "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_c394215c914eb1852c617c54bbb" DEFAULT 0,
                CONSTRAINT "PK_789e99214c8f2bf186c167d4dfa" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecord"
            ALTER COLUMN "facilityId" nvarchar(10) NOT NULL
        `);

    /**
     * Commands to populate the FacilityUtilisation data with required
     * data so that the foreign key constraint can be added. This query
     * sets the FacilityUtilisation report period to the oldest report
     * period associated with the fee record with the inserted facility
     * id.
     */
    await queryRunner.query(`
            INSERT INTO "FacilityUtilisationData" (
                "id",
                "reportPeriodStartMonth",
                "reportPeriodStartYear",
                "reportPeriodEndMonth",
                "reportPeriodEndYear"
            ) SELECT
                "facilityId",
                "reportPeriodStartMonth",
                "reportPeriodStartYear",
                "reportPeriodEndMonth",
                "reportPeriodEndYear"
            FROM (
                SELECT
                    "facilityId",
                    "reportPeriodStartMonth",
                    "reportPeriodStartYear",
                    "reportPeriodEndMonth",
                    "reportPeriodEndYear",
                    ROW_NUMBER() OVER (
                        PARTITION BY "facilityId" ORDER BY "reportPeriodStartYear" ASC, "reportPeriodStartMonth" ASC
                    ) as "rowNumber"
                FROM "FeeRecord"
                LEFT JOIN "UtilisationReport" ON "FeeRecord"."reportId" = "UtilisationReport"."id"
            ) AS "t"
            WHERE "t"."rowNumber" = 1
        `);
    await queryRunner.query(`
            UPDATE "FacilityUtilisationData"
            SET "lastUpdatedByIsSystemUser" = 1
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
            ADD "facilityId" nvarchar(255) NOT NULL
        `);
    await queryRunner.query(`
            DROP TABLE "FacilityUtilisationData"
        `);
  }
}
