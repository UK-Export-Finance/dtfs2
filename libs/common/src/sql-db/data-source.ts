import { DataSource } from 'typeorm';
import path from 'path';
import { sqlDbConfig } from './config';

const { SQL_DB_HOST, SQL_DB_PORT, SQL_DB_USERNAME, SQL_DB_PASSWORD, SQL_DB_NAME, SQL_DB_LOGGING } = sqlDbConfig;

export const SqlDbDataSource = new DataSource({
  type: 'mssql',
  host: SQL_DB_HOST,
  port: SQL_DB_PORT,
  username: SQL_DB_USERNAME,
  password: SQL_DB_PASSWORD,
  database: SQL_DB_NAME,
  synchronize: false,
  logging: SQL_DB_LOGGING,
  entities: [path.join(__dirname, 'entity/*.ts')],
  migrations: [path.join(__dirname, 'migrations/*.ts')],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});
