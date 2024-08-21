import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FacilityUtilisationDataEntity, ReportPeriodPartialEntity } from '@ukef/dtfs2-common';
import { DataSource } from 'typeorm';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const JSON_FILE_PATH = resolve(__dirname, 'acbs-utilisation-data.json');

const REPORT_PERIOD: ReportPeriodPartialEntity = {
  start: { month: 1, year: 2020 },
  end: { month: 3, year: 2020 },
};

type UtilisationDataEntry = {
  facilityId: string;
  utilisation: number;
  fixedFeePremium: number;
};

const validateReportPeriod = (reportPeriod: ReportPeriodPartialEntity): void => {
  const { start, end } = reportPeriod;
  if (start.year > end.year || (start.year === end.year && start.month > end.month)) {
    throw new Error('Report period end date cannot be before start date');
  }
};

const insertFacilityUtilisationEntry = async (dataSource: DataSource, { facilityId, utilisation, fixedFeePremium }: UtilisationDataEntry) => {
  const facilityUtilisationData = new FacilityUtilisationDataEntity();
  facilityUtilisationData.id = facilityId;
  facilityUtilisationData.reportPeriod = REPORT_PERIOD;
  facilityUtilisationData.utilisation = utilisation;
  facilityUtilisationData.fixedFee = fixedFeePremium;
  facilityUtilisationData.updateLastUpdatedBy({ platform: 'SYSTEM' });

  await dataSource.manager.save(FacilityUtilisationDataEntity, facilityUtilisationData);
};

const run = async () => {
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
    console.error('Failed to migrate ACBS utilisation data to TFM:', error);
  } finally {
    await dataSource.destroy();
  }
};

(async () => {
  await run();
})();
