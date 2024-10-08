-- ENABLE ROLLBACK TRANSACTION ON ERROR
set
  xact_abort on;

BEGIN TRAN;

-- DROP EXISTING CONSTRAINTS ON LEDGER TABLES
ALTER TABLE
  "FeeRecord" DROP CONSTRAINT "FK_f90d2441e5bee2fa7de081fdb21";

ALTER TABLE
  "AzureFileInfo" DROP CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f";

DROP INDEX "REL_4370b01aed42cea044ee2b1ce6" ON "AzureFileInfo";

ALTER TABLE
  "FeeRecord" DROP CONSTRAINT "DF_1eb3a649cce84deaa2a20390401";

ALTER TABLE
  "fee_record_payments_payment" DROP CONSTRAINT "FK_7a9b7aa849fc3bb09d80fa1f812";

DROP INDEX "IDX_23bbb10be5f2136a5a5086654e" ON "fee_record_payments_payment";

DROP INDEX "IDX_7a9b7aa849fc3bb09d80fa1f81" ON "fee_record_payments_payment";

ALTER TABLE
  "fee_record_payments_payment" DROP CONSTRAINT "FK_23bbb10be5f2136a5a5086654e8";

ALTER TABLE
  "AzureFileInfo" DROP CONSTRAINT "DF_e2915e153159a656ef90279d58a";

ALTER TABLE
  "AzureFileInfo" DROP CONSTRAINT "DF_5b2813faa091ae4c63bc13a88ec";

ALTER TABLE
  "AzureFileInfo" DROP CONSTRAINT "PK_ea6ad35b38f9b9e248b432d1a1e";

ALTER TABLE
  "FeeRecord" DROP CONSTRAINT "DF_cec2cb2f5a2ccf4ac19cb938fd0";

ALTER TABLE
  "FeeRecord" DROP CONSTRAINT "DF_7121ac2f65fd8b070ffd591ed37";

ALTER TABLE
  "FeeRecord" DROP CONSTRAINT "PK_9488afe4d9d39fec32e7c53d47a";

ALTER TABLE
  "UtilisationReport" DROP CONSTRAINT "DF_268b233fa63b90c8ebda1bad341";

ALTER TABLE
  "UtilisationReport" DROP CONSTRAINT "DF_edb079a13cd83e211bc24c2b0b9";

ALTER TABLE
  "UtilisationReport" DROP CONSTRAINT "PK_98a789a9ebdc731bd04ec00860a";

ALTER TABLE
  "Payment" DROP CONSTRAINT "DF_3c7c91b94fc3c2cb358a90fa629";

ALTER TABLE
  "Payment" DROP CONSTRAINT "DF_c095a0510351d4262872da05235";

ALTER TABLE
  "Payment" DROP CONSTRAINT "PK_07e9fb9a8751923eb876d57a575";

ALTER TABLE
  "fee_record_payments_payment" DROP CONSTRAINT "PK_b27631d6ebc4d310641d876f8a4";

-- COPY EXISTING QUERIES IN ORDER FROM MIGRATIONS TO ADD TABLES
CREATE TABLE "AzureFileInfoCopy" (
  "id" int NOT NULL IDENTITY(1, 1),
  "folder" nvarchar(255) NOT NULL,
  "filename" nvarchar(255) NOT NULL,
  "fullPath" nvarchar(255) NOT NULL,
  "url" nvarchar(255) NOT NULL,
  "mimetype" nvarchar(255) NOT NULL,
  "utilisationReportId" int NOT NULL,
  "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_e2915e153159a656ef90279d58a" DEFAULT getdate(),
  "lastUpdatedByPortalUserId" nvarchar(255),
  "lastUpdatedByTfmUserId" nvarchar(255),
  "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_5b2813faa091ae4c63bc13a88ec" DEFAULT 0,
  CONSTRAINT "PK_ea6ad35b38f9b9e248b432d1a1e" PRIMARY KEY ("id")
);

CREATE TABLE "FeeRecordCopy" (
  "id" int NOT NULL IDENTITY(1, 1),
  "facilityId" nvarchar(255) NOT NULL,
  "exporter" nvarchar(255) NOT NULL,
  "baseCurrency" nvarchar(255) NOT NULL,
  "facilityUtilisation" decimal(14, 2) NOT NULL,
  "totalFeesAccruedForThePeriod" decimal(14, 2) NOT NULL,
  "totalFeesAccruedForThePeriodCurrency" nvarchar(255) NOT NULL,
  "totalFeesAccruedForThePeriodExchangeRate" decimal(14, 8) NOT NULL,
  "feesPaidToUkefForThePeriod" decimal(14, 2) NOT NULL,
  "feesPaidToUkefForThePeriodCurrency" nvarchar(255) NOT NULL,
  "paymentCurrency" nvarchar(255) NOT NULL,
  "paymentExchangeRate" decimal(14, 8) NOT NULL,
  "reportId" int NOT NULL,
  "status" nvarchar(255) NOT NULL CONSTRAINT "DF_1eb3a649cce84deaa2a20390401" DEFAULT 'TO_DO',
  "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_cec2cb2f5a2ccf4ac19cb938fd0" DEFAULT getdate(),
  "lastUpdatedByPortalUserId" nvarchar(255),
  "lastUpdatedByTfmUserId" nvarchar(255),
  "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_7121ac2f65fd8b070ffd591ed37" DEFAULT 0,
  CONSTRAINT "PK_9488afe4d9d39fec32e7c53d47a" PRIMARY KEY ("id")
);

CREATE TABLE "UtilisationReportCopy" (
  "id" int NOT NULL IDENTITY(1, 1),
  "bankId" nvarchar(255) NOT NULL,
  "dateUploaded" datetime2,
  "status" nvarchar(255) NOT NULL,
  "uploadedByUserId" nvarchar(255),
  "reportPeriodStartMonth" int NOT NULL,
  "reportPeriodStartYear" int NOT NULL,
  "reportPeriodEndMonth" int NOT NULL,
  "reportPeriodEndYear" int NOT NULL,
  "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_268b233fa63b90c8ebda1bad341" DEFAULT getdate(),
  "lastUpdatedByPortalUserId" nvarchar(255),
  "lastUpdatedByTfmUserId" nvarchar(255),
  "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_edb079a13cd83e211bc24c2b0b9" DEFAULT 0,
  CONSTRAINT "PK_98a789a9ebdc731bd04ec00860a" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentCopy" (
  "id" int NOT NULL IDENTITY(1, 1),
  "currency" nvarchar(255) NOT NULL,
  "amount" decimal(14, 2) NOT NULL,
  "dateReceived" datetime NOT NULL,
  "reference" nvarchar(255) NULL,
  "lastUpdatedAt" datetime2 NOT NULL CONSTRAINT "DF_3c7c91b94fc3c2cb358a90fa629" DEFAULT getdate(),
  "lastUpdatedByPortalUserId" nvarchar(255),
  "lastUpdatedByTfmUserId" nvarchar(255),
  "lastUpdatedByIsSystemUser" bit NOT NULL CONSTRAINT "DF_c095a0510351d4262872da05235" DEFAULT 0,
  CONSTRAINT "PK_07e9fb9a8751923eb876d57a575" PRIMARY KEY ("id")
);

CREATE TABLE "fee_record_payments_payment_copy" (
  "feeRecordId" int NOT NULL,
  "paymentId" int NOT NULL,
  CONSTRAINT "PK_b27631d6ebc4d310641d876f8a4" PRIMARY KEY ("feeRecordId", "paymentId")
);

-- COPY EXISTING DATA INTO NEW TABLES
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
    [status],
    uploadedByUserId,
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
  [status],
  uploadedByUserId,
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
    [status],
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
  [status],
  lastUpdatedAt,
  lastUpdatedByIsSystemUser,
  lastUpdatedByPortalUserId,
  lastUpdatedByTfmUserId
FROM
  "FeeRecord";

SET
  IDENTITY_INSERT "FeeRecordCopy" OFF;

SET
  IDENTITY_INSERT "PaymentCopy" ON;

INSERT INTO
  "PaymentCopy" (
    id,
    currency,
    amount,
    dateReceived,
    reference,
    lastUpdatedAt,
    lastUpdatedByIsSystemUser,
    lastUpdatedByPortalUserId,
    lastUpdatedByTfmUserId
  )
SELECT
  id,
  currency,
  amount,
  dateReceived,
  reference,
  lastUpdatedAt,
  lastUpdatedByIsSystemUser,
  lastUpdatedByPortalUserId,
  lastUpdatedByTfmUserId
FROM
  "Payment";

SET
  IDENTITY_INSERT "PaymentCopy" OFF;

INSERT INTO
  "fee_record_payments_payment_copy"
SELECT
  *
FROM
  "fee_record_payments_payment";

-- DELETE EXISTING LEDGER TABLES IN ORDER
DROP TABLE "Payment";

DROP TABLE "FeeRecord";

DROP TABLE "AzureFileInfo";

DROP TABLE "UtilisationReport";

DROP TABLE "fee_record_payments_payment";

-- RENAME NEW TABLES
exec sp_rename "UtilisationReportCopy",
"UtilisationReport";

exec sp_rename "AzureFileInfoCopy",
"AzureFileInfo";

exec sp_rename "FeeRecordCopy",
"FeeRecord";

exec sp_rename "PaymentCopy",
"Payment";

exec sp_rename "fee_record_payments_payment_copy",
"fee_record_payments_payment";

-- ADD CONSTRAINTS
CREATE UNIQUE INDEX "REL_4370b01aed42cea044ee2b1ce6" ON "AzureFileInfo" ("utilisationReportId")
WHERE
  "utilisationReportId" IS NOT NULL;

ALTER TABLE
  "AzureFileInfo"
ADD
  CONSTRAINT "FK_4370b01aed42cea044ee2b1ce6f" FOREIGN KEY ("utilisationReportId") REFERENCES "UtilisationReport"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
  "FeeRecord"
ADD
  CONSTRAINT "FK_f90d2441e5bee2fa7de081fdb21" FOREIGN KEY ("reportId") REFERENCES "UtilisationReport"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE INDEX "IDX_7a9b7aa849fc3bb09d80fa1f81" ON "fee_record_payments_payment" ("feeRecordId");

CREATE INDEX "IDX_23bbb10be5f2136a5a5086654e" ON "fee_record_payments_payment" ("paymentId");

ALTER TABLE
  "fee_record_payments_payment"
ADD
  CONSTRAINT "FK_7a9b7aa849fc3bb09d80fa1f812" FOREIGN KEY ("feeRecordId") REFERENCES "FeeRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE
  "fee_record_payments_payment"
ADD
  CONSTRAINT "FK_23bbb10be5f2136a5a5086654e8" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;