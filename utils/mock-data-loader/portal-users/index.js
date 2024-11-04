import { ROLES } from '@ukef/dtfs2-common';
import MOCK_BANKS from '../banks';

const UKEF_TEST_BANK_1 = MOCK_BANKS.find((bank) => bank.name === 'UKEF test bank (Delegated)');
const UKEF_TEST_BANK_2 = MOCK_BANKS.find((bank) => bank.name === 'UKEF test bank (Delegated) 2');
const UKEF_GEF_ONLY_BANK = MOCK_BANKS.find((bank) => bank.name === 'GEF Only Bank');

export const BANK1_MAKER1 = {
  username: 'maker1@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'First',
  surname: 'Last',
  email: 'maker1@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.MAKER],
  bank: UKEF_TEST_BANK_1,
  isTrusted: true,
};

export const BANK1_MAKER2 = {
  username: 'maker2@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Tamara',
  surname: 'last',
  email: 'maker2@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.MAKER],
  bank: UKEF_TEST_BANK_1,
  isTrusted: false,
};

export const BANK1_MAKER3 = {
  username: 'maker33@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'First',
  surname: 'Last',
  email: 'maker33@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.MAKER],
  bank: UKEF_TEST_BANK_1,
  isTrusted: false,
};

export const BANK1_READ_ONLY1 = {
  username: 'readOnly1@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Bank1',
  surname: 'Read-only',
  email: 'readOnly1@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.READ_ONLY],
  bank: UKEF_TEST_BANK_1,
  isTrusted: false,
};

export const BANK3_GEF_MAKER1 = {
  username: 'maker3@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Benito',
  surname: 'Sutton',
  email: 'maker3@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.MAKER],
  bank: UKEF_GEF_ONLY_BANK,
  isTrusted: false,
};

export const BANK3_GEF_CHECKER1 = {
  username: 'maker4@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Tony',
  surname: 'Sheridan',
  email: 'maker4@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.CHECKER],
  bank: UKEF_GEF_ONLY_BANK,
  isTrusted: false,
};

export const BANK1_CHECKER1 = {
  username: 'checker1@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Mister',
  surname: 'Checker',
  email: 'checker1@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.CHECKER],
  bank: UKEF_TEST_BANK_1,
  isTrusted: false,
};

export const BANK1_MAKER_CHECKER1 = {
  username: 'checker2@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Vladimir',
  surname: 'Scorpius',
  email: 'checker2@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.MAKER, ROLES.CHECKER],
  bank: UKEF_TEST_BANK_1,
  isTrusted: false,
};

export const BANK1_MAKER_CHECKER2 = {
  username: 'checker3@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Vladimir',
  surname: 'Scorpius',
  email: 'checker3@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.MAKER, ROLES.CHECKER],
  bank: UKEF_TEST_BANK_1,
  isTrusted: false,
};

export const BANK1_PAYMENT_REPORT_OFFICER1 = {
  username: 'payment-officer1@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Payton',
  surname: 'Archer',
  email: 'payment-officer1@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.PAYMENT_REPORT_OFFICER],
  bank: UKEF_TEST_BANK_1,
  isTrusted: false,
};

export const BANK1_MAKER_PAYMENT_REPORT_OFFICER1 = {
  username: 'payment-officer2@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Payton',
  surname: 'Archer',
  email: 'payment-officer2@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.MAKER, ROLES.PAYMENT_REPORT_OFFICER],
  bank: UKEF_TEST_BANK_1,
  isTrusted: false,
};

export const BANK2_PAYMENT_REPORT_OFFICER1 = {
  username: 'payment-officer3@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Payton',
  surname: 'Archer',
  email: 'payment-officer3@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.PAYMENT_REPORT_OFFICER],
  bank: UKEF_TEST_BANK_2,
  isTrusted: false,
};

export const BANK2_MAKER2 = {
  username: 'maker5@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Tamara',
  surname: 'last',
  email: 'maker5@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.MAKER],
  bank: UKEF_TEST_BANK_2,
  isTrusted: false,
};

export const BANK2_MAKER1 = {
  username: 'maker6@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'First',
  surname: 'Last',
  email: 'maker6@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.MAKER],
  bank: UKEF_TEST_BANK_2,
  isTrusted: false,
};

export const BANK2_CHECKER1 = {
  username: 'checker4@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Mister',
  surname: 'Checker',
  email: 'checker4@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.CHECKER],
  bank: UKEF_TEST_BANK_2,
  isTrusted: false,
};

export const BANK2_READ_ONLY1 = {
  username: 'readonly2@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Reid',
  surname: 'Oakley',
  email: 'readonly2@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.READ_ONLY],
  bank: UKEF_TEST_BANK_2,
  isTrusted: false,
};

export const ADMIN = {
  username: 'test2@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Julius',
  surname: 'No',
  email: 'test2@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.ADMIN, ROLES.MAKER],
  bank: {
    id: '*',
  },
  isTrusted: false,
};

export const READ_ONLY = {
  username: 'readonly@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Reid',
  surname: 'Oakley',
  email: 'readonly@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.READ_ONLY],
  bank: {
    id: '*',
  },
  isTrusted: false,
};

export const ADMINNOMAKER = {
  username: 'adminnomaker@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Julius',
  surname: 'No',
  email: 'adminnomaker@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.ADMIN],
  bank: {
    id: '*',
  },
  isTrusted: false,
};

export const TEST_EMAIL_NO_GOV_NOTIFY = {
  username: 'test_no_notify@ukexportfinance.gov.uk',
  password: 'AbC!2345',
  firstname: 'Wolfgang',
  surname: 'Weisen',
  email: 'test_no_notify@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [ROLES.MAKER],
  bank: {
    id: '*',
  },
  isTrusted: false,
};

const MOCK_USERS = {
  BANK1_MAKER1,
  BANK1_MAKER2,
  BANK1_MAKER3,
  BANK1_READ_ONLY1,
  BANK3_GEF_MAKER1,
  BANK3_GEF_CHECKER1,
  BANK1_CHECKER1,
  BANK1_MAKER_CHECKER1,
  BANK1_MAKER_CHECKER2,
  BANK1_PAYMENT_REPORT_OFFICER1,
  BANK1_MAKER_PAYMENT_REPORT_OFFICER1,
  BANK2_PAYMENT_REPORT_OFFICER1,
  BANK2_MAKER2,
  BANK2_MAKER1,
  BANK2_CHECKER1,
  BANK2_READ_ONLY1,
  ADMIN,
  READ_ONLY,
  ADMINNOMAKER,
  TEST_EMAIL_NO_GOV_NOTIFY,
};

export default MOCK_USERS;
