import { DbRequestSourceParam } from '../helpers';

export type CreateAzureFileInfoParams = DbRequestSourceParam & {
  folder: string;
  filename: string;
  fullPath: string;
  url: string;
  mimetype: string;
};
