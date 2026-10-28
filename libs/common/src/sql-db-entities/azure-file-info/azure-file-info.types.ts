import { DbRequestSourceParam } from '@ukef/sql-db-entities/helpers';

export type CreateAzureFileInfoParams = DbRequestSourceParam & {
  folder: string;
  filename: string;
  fullPath: string;
  url: string;
  mimetype: string;
};
