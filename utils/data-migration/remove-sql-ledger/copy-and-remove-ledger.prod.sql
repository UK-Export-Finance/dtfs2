-- ENABLE ROLLBACK TRANSACTION ON ERROR
set
  xact_abort on;

BEGIN TRAN;

-- REMOVE EXISTING CONSTRAINTS
ALTER TABLE
  "FeeRecord" DROP CONSTRAINT "FK_f90d2441e5bee2fa7de081fdb21";

ALTER TABLE
  "AzureFileInfo" DROP CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f";

DROP INDEX "REL_4370b01aed42cea044ee2b1ce6" ON "AzureFileInfo";

ALTER TABLE
  "AzureFileInfo" DROP CONSTRAINT "PK_ea6ad35b38f9b9e248b432d1a1e";

ALTER TABLE
  "FeeRecord" DROP CONSTRAINT "PK_9488afe4d9d39fec32e7c53d47a";

ALTER TABLE
  "UtilisationReport" DROP CONSTRAINT "PK_98a789a9ebdc731bd04ec00860a";

ALTER TABLE
  "AzureFileInfo" DROP CONSTRAINT "DF_e2915e153159a656ef90279d58a";

ALTER TABLE
  "AzureFileInfo" DROP CONSTRAINT "DF_5b2813faa091ae4c63bc13a88ec";

ALTER TABLE
  "FeeRecord" DROP CONSTRAINT "DF_cec2cb2f5a2ccf4ac19cb938fd0";

ALTER TABLE
  "FeeRecord" DROP CONSTRAINT "DF_7121ac2f65fd8b070ffd591ed37";

ALTER TABLE
  "UtilisationReport" DROP CONSTRAINT "DF_268b233fa63b90c8ebda1bad341";

ALTER TABLE
  "UtilisationReport" DROP CONSTRAINT "DF_edb079a13cd83e211bc24c2b0b9";

-- CREATE NEW TABLES WITH CONSTRAINTS
CREATE TABLE "AzureFileInfoCopy" (
  "id" int NOT NULL IDENTITY (1, 1),
  "folder" nvarchar (255) NOT NULL,
  "filename" nvarchar (255) NOT NULL,
  "fullPath" nvarchar (255) NOT NULL,
  "url" nvarchar (255) NOT NULL,
  "mimetype" nvarchar (255) NOT NULL,
  "utilisationReportId" int NOT NULL,
  "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_e2915e153159a656ef90279d58a" DEFAULT getdate (),
  "lastUpdatedByPortalUserId" nvarchar (255),
  "lastUpdatedByTfmUserId" nvarchar (255),
  "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_5b2813faa091ae4c63bc13a88ec" DEFAULT 0,
  CONSTRAINT "PK_ea6ad35b38f9b9e248b432d1a1e" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "REL_4370b01aed42cea044ee2b1ce6" ON "AzureFileInfoCopy" ("utilisationReportId")
WHERE
  "utilisationReportId" IS NOT NULL;

CREATE TABLE "FeeRecordCopy" (
  "id" int NOT NULL IDENTITY (1, 1),
  "facilityId" nvarchar (255) NOT NULL,
  "exporter" nvarchar (255) NOT NULL,
  "baseCurrency" nvarchar (255) NOT NULL,
  "facilityUtilisation" decimal(14, 2) NOT NULL,
  "totalFeesAccruedForThePeriod" decimal(14, 2) NOT NULL,
  "totalFeesAccruedForThePeriodCurrency" nvarchar (255) NOT NULL,
  "totalFeesAccruedForThePeriodExchangeRate" decimal(14, 8) NOT NULL,
  "feesPaidToUkefForThePeriod" decimal(14, 2) NOT NULL,
  "feesPaidToUkefForThePeriodCurrency" nvarchar (255) NOT NULL,
  "paymentCurrency" nvarchar (255) NOT NULL,
  "paymentExchangeRate" decimal(14, 8) NOT NULL,
  "reportId" int NOT NULL,
  "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_cec2cb2f5a2ccf4ac19cb938fd0" DEFAULT getdate (),
  "lastUpdatedByPortalUserId" nvarchar (255),
  "lastUpdatedByTfmUserId" nvarchar (255),
  "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_7121ac2f65fd8b070ffd591ed37" DEFAULT 0,
  CONSTRAINT "PK_9488afe4d9d39fec32e7c53d47a" PRIMARY KEY ("id")
);

CREATE TABLE "UtilisationReportCopy" (
  "id" int NOT NULL IDENTITY (1, 1),
  "bankId" nvarchar (255) NOT NULL,
  "dateUploaded" datetime2,
  "status" nvarchar (255) NOT NULL,
  "uploadedByUserId" nvarchar (255),
  "reportPeriodStartMonth" int NOT NULL,
  "reportPeriodStartYear" int NOT NULL,
  "reportPeriodEndMonth" int NOT NULL,
  "reportPeriodEndYear" int NOT NULL,
  "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_268b233fa63b90c8ebda1bad341" DEFAULT getdate (),
  "lastUpdatedByPortalUserId" nvarchar (255),
  "lastUpdatedByTfmUserId" nvarchar (255),
  "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_edb079a13cd83e211bc24c2b0b9" DEFAULT 0,
  CONSTRAINT "PK_98a789a9ebdc731bd04ec00860a" PRIMARY KEY ("id")
);

ALTER TABLE
  "AzureFileInfoCopy"
ADD
  CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f" FOREIGN KEY ("utilisationReportId") REFERENCES "UtilisationReportCopy" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
  "FeeRecordCopy"
ADD
  CONSTRAINT "FK_f90d2441e5bee2fa7de081fdb21" FOREIGN KEY ("reportId") REFERENCES "UtilisationReportCopy" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- COPY EXISTING DATA
SET
  IDENTITY_INSERT "UtilisationReportCopy" ON;

INSERT INTO
  "UtilisationReportCopy" (
    id,
    bankId,
    reportPeriodStartMonth,
    reportPeriodStartYear,
    reportPeriodEndMonth,
    reportPeriodEndYear,
    dateUploaded,
    uploadedByUserId,
    [status],
    lastUpdatedAt,
    lastUpdatedByIsSystemUser,
    lastUpdatedByPortalUserId,
    lastUpdatedByTfmUserId
  )
SELECT
  id,
  bankId,
  reportPeriodStartMonth,
  reportPeriodStartYear,
  reportPeriodEndMonth,
  reportPeriodEndYear,
  dateUploaded,
  uploadedByUserId,
  [status],
  lastUpdatedAt,
  lastUpdatedByIsSystemUser,
  lastUpdatedByPortalUserId,
  lastUpdatedByTfmUserId
FROM
  "UtilisationReport";

SET
  IDENTITY_INSERT "UtilisationReportCopy" OFF;

SET
  IDENTITY_INSERT "AzureFileInfoCopy" ON;

INSERT INTO
  "AzureFileInfoCopy" (
    id,
    folder,
    [filename],
    fullPath,
    [url],
    mimetype,
    utilisationReportId,
    lastUpdatedAt,
    lastUpdatedByIsSystemUser,
    lastUpdatedByPortalUserId,
    lastUpdatedByTfmUserId
  )
SELECT
  id,
  folder,
  [filename],
  fullPath,
  [url],
  mimetype,
  utilisationReportId,
  lastUpdatedAt,
  lastUpdatedByIsSystemUser,
  lastUpdatedByPortalUserId,
  lastUpdatedByTfmUserId
FROM
  "AzureFileInfo";

SET
  IDENTITY_INSERT "AzureFileInfoCopy" OFF;

SET
  IDENTITY_INSERT "FeeRecordCopy" ON;

INSERT INTO
  "FeeRecordCopy" (
    id,
    reportId,
    facilityId,
    exporter,
    baseCurrency,
    facilityUtilisation,
    totalFeesAccruedForThePeriod,
    totalFeesAccruedForThePeriodCurrency,
    totalFeesAccruedForThePeriodExchangeRate,
    feesPaidToUkefForThePeriod,
    feesPaidToUkefForThePeriodCurrency,
    paymentCurrency,
    paymentExchangeRate,
    lastUpdatedAt,
    lastUpdatedByIsSystemUser,
    lastUpdatedByPortalUserId,
    lastUpdatedByTfmUserId
  )
SELECT
  id,
  reportId,
  facilityId,
  exporter,
  baseCurrency,
  facilityUtilisation,
  totalFeesAccruedForThePeriod,
  totalFeesAccruedForThePeriodCurrency,
  totalFeesAccruedForThePeriodExchangeRate,
  feesPaidToUkefForThePeriod,
  feesPaidToUkefForThePeriodCurrency,
  paymentCurrency,
  paymentExchangeRate,
  lastUpdatedAt,
  lastUpdatedByIsSystemUser,
  lastUpdatedByPortalUserId,
  lastUpdatedByTfmUserId
FROM
  "FeeRecord";

SET
  IDENTITY_INSERT "FeeRecordCopy" OFF;

-- DROP LEDGER TABLES
DROP TABLE "FeeRecord";

DROP TABLE "AzureFileInfo";

DROP TABLE "UtilisationReport";

-- RENAME NEW TABLES
exec sp_rename "UtilisationReportCopy",
"UtilisationReport";

exec sp_rename "AzureFileInfoCopy",
"AzureFileInfo";

exec sp_rename "FeeRecordCopy",
"FeeRecord";

COMMIT TRAN;