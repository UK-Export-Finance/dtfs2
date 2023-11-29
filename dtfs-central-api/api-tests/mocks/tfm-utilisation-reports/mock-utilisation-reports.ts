import * as BANKS from '../banks';

interface UtilisationReport {
  bank: {
    id: string;
    name: string;
  };
  month: number;
  year: number;
  azureFileInfo?: {
    fullPath: string;
  };
}

const mockUtilisationReports: UtilisationReport[] = [
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

export default mockUtilisationReports;
