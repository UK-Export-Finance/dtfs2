import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { seedUtilisationReportData } from './utilisation-report/utilisation-report.seed';

dotenv.config();

async function seed(dbSource: DataSource) {
  try {
    await seedUtilisationReportData(dbSource);
  } catch (err) {
    console.error(err);
  } finally {
    await dbSource.destroy();
  }
}

SqlDbDataSource.initialize()
  .then(async (dbSource) => {
    await seed(dbSource);
  })
  .catch(() => {});
