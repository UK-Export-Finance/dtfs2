import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropFacilityUtilisationDataTable1739352522322 implements MigrationInterface {
  name = 'DropFacilityUtilisationDataTable1739352522322';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "FacilityUtilisationData"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "FacilityUtilisationData" (
            "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_5e17cd4417568f3be4c469c70cb" DEFAULT getdate(),
            "lastUpdatedByPortalUserId" nvarchar(255),
            "lastUpdatedByTfmUserId" nvarchar(255),
            "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_c394215c914eb1852c617c54bbb" DEFAULT 0,
            "id" nvarchar(10) NOT NULL,
            "utilisation" decimal(14, 2) NOT NULL CONSTRAINT "DF_4af84a919cb3a1ea143b4a93f00" DEFAULT 0,
            "fixedFee" decimal(14, 2) NOT NULL CONSTRAINT "DF_e4f3bdf7db7228fa36d4a6c9f4b" DEFAULT 0,
            "reportPeriodStartMonth" int NOT NULL,
            "reportPeriodStartYear" int NOT NULL,
            "reportPeriodEndMonth" int NOT NULL,
            "reportPeriodEndYear" int NOT NULL,
            CONSTRAINT "PK_789e99214c8f2bf186c167d4dfa" PRIMARY KEY ("id")
        )
    `);
  }
}
