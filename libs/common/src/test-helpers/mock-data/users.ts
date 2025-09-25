import { ROLES } from '../../constants';
import MOCK_BANKS from './banks';

const UKEF_TEST_BANK_1 = MOCK_BANKS.find((bank) => bank.name === 'Bank 1');

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
