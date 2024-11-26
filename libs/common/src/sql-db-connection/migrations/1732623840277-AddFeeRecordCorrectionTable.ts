import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeRecordCorrectionTable1732623840277 implements MigrationInterface {
  name = 'AddFeeRecordCorrectionTable1732623840277';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "FeeRecordCorrection" (
                "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_2a8fbc455f0b05fc97675ec4b1e" DEFAULT getdate(),
                "lastUpdatedByPortalUserId" nvarchar(255),
                "lastUpdatedByTfmUserId" nvarchar(255),
                "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_da9ebf56aea47e1ca26c5d38cff" DEFAULT 0,
                "id" int NOT NULL IDENTITY(1, 1),
                "reasons" ntext NOT NULL,
                "additionalInfo" ntext NOT NULL,
                "dateRequested" datetime2 NOT NULL CONSTRAINT "DF_489233b45b51a528c7c12d9e999" DEFAULT getdate(),
                "isCompleted" bit NOT NULL,
                "feeRecordId" int NOT NULL,
                "requestedByUserId" nvarchar(255) NOT NULL,
                "requestedByUserFirstname" nvarchar(255) NOT NULL,
                "requestedByUserLastname" nvarchar(255) NOT NULL,
                CONSTRAINT "PK_b9f1a68a02c0d2bafcf977331e5" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection"
            ADD CONSTRAINT "FK_5e0f046951d2260071b867d12af" FOREIGN KEY ("feeRecordId") REFERENCES "FeeRecord"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "FeeRecordCorrection" DROP CONSTRAINT "FK_5e0f046951d2260071b867d12af"
        `);
    await queryRunner.query(`
            DROP TABLE "FeeRecordCorrection"
        `);
  }
}
