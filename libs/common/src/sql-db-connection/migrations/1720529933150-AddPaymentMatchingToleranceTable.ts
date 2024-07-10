import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddToleranceTable1720529933150 implements MigrationInterface {
  name = 'AddToleranceTable1720529933150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "PaymentMatchingTolerance" (
                "id" int NOT NULL IDENTITY(1, 1),
                "currency" nvarchar(255) NOT NULL,
                "threshold" decimal(14, 2) NOT NULL CONSTRAINT "DF_84e964faf0832565e74acface1c" DEFAULT 0,
                "isActive" bit NOT NULL,
                "createdAt" datetime2 NOT NULL CONSTRAINT "DF_3e4569f7a141d9aabbfb0604c4a" DEFAULT getdate(),
                "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_8aeff8c27cdf53177a591bfe6b3" DEFAULT getdate(),
                "lastUpdatedByPortalUserId" nvarchar(255),
                "lastUpdatedByTfmUserId" nvarchar(255),
                "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_bc16381e19cb86872110e1ba941" DEFAULT 0,
                CONSTRAINT "PK_500a234973c80db2c83da338918" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            INSERT INTO "PaymentMatchingTolerance" (currency, threshold, isActive, lastUpdatedByIsSystemUser)
            VALUES
              ('GBP', 0, 1, 1),
              ('JPY', 0, 1, 1),
              ('EUR', 0, 1, 1),
              ('USD', 0, 1, 1)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "PaymentMatchingTolerance"
        `);
  }
}
