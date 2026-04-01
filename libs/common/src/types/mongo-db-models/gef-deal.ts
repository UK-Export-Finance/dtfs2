import { AnyObject } from '../any-object';

type AccountingReferenceDate = {
  day: string;
  month: string;
};

type AccountsPeriod = {
  madeUpTo: string;
  periodEndOn: string;
  periodStartOn: string;
  type: string;
};

type NextAccountsPeriod = {
  dueOn: string;
  overdue: boolean;
  periodEndOn: string;
  periodStartOn: string;
};

type Accounts = {
  accountingReferenceDate: AccountingReferenceDate;
  lastAccounts: AccountsPeriod;
  nextAccounts: NextAccountsPeriod;
  nextDue: string;
  nextMadeUpTo: string;
  overdue: boolean;
};

type RegisteredAddress = {
  addressLine1: string;
  country: string;
  locality: string;
  postalCode: string;
  region: string;
};

type IndustryClass = {
  code: string;
  name: string;
};

type Industry = {
  code: string;
  name: string;
  class: IndustryClass;
};

export type GefExporter = {
  status: string;
  accounts: Accounts;
  companiesHouseRegistrationNumber: string;
  companyName: string;
  dateOfCreation: string;
  registeredAddress: RegisteredAddress;
  industries: Industry[];
  isActive: boolean;
  selectedIndustry: Industry;
  correspondenceAddress: AnyObject | null;
  smeType: string;
  probabilityOfDefault: number;
  isFinanceIncreasing: boolean;
  updatedAt: number;
};
