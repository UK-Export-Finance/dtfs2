import { DataSource } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { SqlDbDataSource } from '../sql-db-connection';

const dataSourceOptions = SqlDbDataSource.options;

const seederOptions: SeederOptions = {
  seeds: ['./**/*.seed.ts'],
  factories: ['./**/*.factory.ts'],
  seedTracking: true,
};

export default new DataSource({
  ...dataSourceOptions,
  ...seederOptions,
});
