import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FacilityUtilisationDataEntity, ReportPeriodPartialEntity, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { DataSource } from 'typeorm';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * The file path to the JSON file containing ACBS utilisation data.
 */
const JSON_FILE_PATH = resolve(__dirname, 'acbs-utilisation-data.json');

/**
 * The report period for the utilisation data.
 */
const REPORT_PERIOD: ReportPeriodPartialEntity = {
  start: { month: 1, year: 2020 },
  end: { month: 3, year: 2020 },
};

type UtilisationDataEntry = {
  facilityId: string;
  utilisation: number;
  fixedFeePremium: number;
};

/**
 * Validates the report period to ensure the end date is not before the start date.
 * @param reportPeriod - The report period to validate.
 * @throws {Error} If the end date is before the start date.
 */
const validateReportPeriod = (reportPeriod: ReportPeriodPartialEntity): void => {
  const { start, end } = reportPeriod;

  const isStartYearAfterEndYear = start.year > end.year;
  const isStartMonthAfterEndMonthInSameYear = start.year === end.year && start.month > end.month;

  if (isStartYearAfterEndYear || isStartMonthAfterEndMonthInSameYear) {
    throw new Error('Report period end date cannot be before start date');
  }
};

/**
 * Inserts a facility utilisation entry into the database.
 * @param dataSource - The data source for database operations.
 * @param utilisationDataEntry - The utilisation data entry to insert.
 * @param utilisationDataEntry.facilityId - The ID of the facility.
 * @param utilisationDataEntry.utilisation - The utilisation value.
 * @param utilisationDataEntry.fixedFeePremium - The fixed fee premium value.
 */
const insertFacilityUtilisationEntry = async (dataSource: DataSource, { facilityId, utilisation, fixedFeePremium }: UtilisationDataEntry) => {
  const facilityUtilisationData = FacilityUtilisationDataEntity.create({
    id: facilityId,
    reportPeriod: REPORT_PERIOD,
    utilisation,
    fixedFee: fixedFeePremium,
    requestSource: { platform: REQUEST_PLATFORM_TYPE.SYSTEM },
  });

  await dataSource.manager.save(FacilityUtilisationDataEntity, facilityUtilisationData);
};

/**
 * Runs the migration process to transfer ACBS utilisation data to TFM.
 * @throws {Error} If the JSON input file is not found.
 */
const runMigrationOfAcbsUtilisationDataToTfm = async () => {
  validateReportPeriod(REPORT_PERIOD);

  const dataSource = await SqlDbDataSource.initialize();

  try {
    if (!existsSync(JSON_FILE_PATH)) {
      throw new Error(`Migration JSON file not found at path: ${JSON_FILE_PATH}`);
    }

    const jsonData = readFileSync(JSON_FILE_PATH, 'utf8');
    const utilisationData = JSON.parse(jsonData) as UtilisationDataEntry[];

    await Promise.all(utilisationData.map((entry) => insertFacilityUtilisationEntry(dataSource, entry)));
  } catch (error) {
    console.error('Failed to migrate ACBS utilisation data to TFM: %o', error);
  } finally {
    await dataSource.destroy();
  }
};

runMigrationOfAcbsUtilisationDataToTfm()
  .then(() => {
    console.info('✅ Migration of ACBS utilisation data to TFM completed successfully.');
  })
  .catch((error) => {
    console.error('Error occurred during migration of ACBS utilisation data to TFM: %s', error);
  });
