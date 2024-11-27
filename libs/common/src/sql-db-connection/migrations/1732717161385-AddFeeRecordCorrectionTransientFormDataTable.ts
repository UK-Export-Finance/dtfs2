import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeRecordCorrectionTransientFormDataTable1732717161385 implements MigrationInterface {
  name = 'AddFeeRecordCorrectionTransientFormDataTable1732717161385';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "FeeRecordCorrectionTransientFormData" (
                "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_0de75775c9857115acce6fce573" DEFAULT getdate(),
                "lastUpdatedByPortalUserId" nvarchar(255),
                "lastUpdatedByTfmUserId" nvarchar(255),
                "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_48cf4c538aa060aacd4c85ce00c" DEFAULT 0,
                "userId" nvarchar(255) NOT NULL,
                "feeRecordId" int NOT NULL,
                "formDataSerialized" nvarchar(1000) NOT NULL,
                CONSTRAINT "PK_6c363929602c71162b5e6bbc3ca" PRIMARY KEY ("userId")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "FeeRecordCorrectionTransientFormData"
        `);
  }
}
