import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeRecordCorrectionTransientFormDataTable1734616272101 implements MigrationInterface {
  name = 'AddFeeRecordCorrectionTransientFormDataTable1734616272101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "FeeRecordCorrectionTransientFormData" (
                "userId" nvarchar(255) NOT NULL,
                "correctionId" int NOT NULL,
                "formDataSerialized" nvarchar(1000) NOT NULL,
                "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_6bf1a666c5c54f26a80a93cb477" DEFAULT getdate(),
                "lastUpdatedByPortalUserId" nvarchar(255),
                "lastUpdatedByTfmUserId" nvarchar(255),
                "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_b1df0154e5994365903d602b917" DEFAULT 0,
                CONSTRAINT "PK_45a48e32ce5faebd4d0f18906c0" PRIMARY KEY ("userId", "correctionId")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "FeeRecordCorrectionTransientFormData"
        `);
  }
}
