import dotenv from 'dotenv';
import { FileshareConfig } from '../types/fileshare';
import { asString } from '../utils/validation';

dotenv.config();

export const AZURE_UTILISATION_REPORTS_FILESHARE_CONFIG: FileshareConfig = {
  FILESHARE_NAME: asString(process.env.AZURE_UTILISATION_REPORTS_FILESHARE_NAME, 'AZURE_UTILISATION_REPORTS_FILESHARE_NAME'),
  STORAGE_ACCOUNT: asString(process.env.AZURE_PORTAL_STORAGE_ACCOUNT, 'AZURE_PORTAL_STORAGE_ACCOUNT'),
  STORAGE_ACCESS_KEY: asString(process.env.AZURE_PORTAL_STORAGE_ACCESS_KEY, 'AZURE_PORTAL_STORAGE_ACCESS_KEY'),
};
