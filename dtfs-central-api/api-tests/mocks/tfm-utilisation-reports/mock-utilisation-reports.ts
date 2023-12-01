import { MockUtilisationReport } from '../../../src/types/mocks';
import BANKS from '../banks';

export const mockUtilisationReports: MockUtilisationReport[] = [
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
