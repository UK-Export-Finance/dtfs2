import { UtilisationReport } from '../../../src/types/utilisation-report-status';
import BANKS from '../banks';

export const mockUtilisationReports: Partial<UtilisationReport>[] = [
  {
    bank: {
      id: BANKS.HSBC.id,
      name: BANKS.HSBC.name,
    },
    month: 1,
    year: 2023,
    azureFileInfo: {
      fullPath: 'www.abc.com',
    },
  },
  {
    bank: {
      id: BANKS.HSBC.id,
      name: BANKS.HSBC.name,
    },
    month: 2,
    year: 2023,
    azureFileInfo: {
      fullPath: 'www.abc.com',
    },
  },
  {
    bank: {
      id: BANKS.HSBC.id,
      name: BANKS.HSBC.name,
    },
    month: 3,
    year: 2023,
    azureFileInfo: {
      fullPath: 'www.abc.com',
    },
  },
];
