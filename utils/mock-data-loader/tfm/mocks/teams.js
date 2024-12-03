const { BANK1_MAKER1, BANK1_CHECKER1, BANK1_MAKER_CHECKER1, BANK1_MAKER_PAYMENT_REPORT_OFFICER1 } = require('../../portal-users');

const TEAMS = {
  UNDERWRITING_SUPPORT: {
    id: 'UNDERWRITING_SUPPORT',
    name: 'Underwriting support',
    email: BANK1_MAKER1.email,
  },
  BUSINESS_SUPPORT: {
    id: 'BUSINESS_SUPPORT',
    name: 'Business support group',
    email: BANK1_MAKER1.email,
  },
  UNDERWRITER_MANAGERS: {
    id: 'UNDERWRITER_MANAGERS',
    name: 'Underwriter managers',
    email: BANK1_CHECKER1.email,
  },
  UNDERWRITERS: {
    id: 'UNDERWRITERS',
    name: 'Underwriters',
    email: BANK1_CHECKER1.email,
  },
  RISK_MANAGERS: {
    id: 'RISK_MANAGERS',
    name: 'Risk managers',
    email: BANK1_CHECKER1.email,
  },
  PIM: {
    id: 'PIM',
    name: 'PIM',
    email: BANK1_MAKER_CHECKER1.email,
  },
  PDC_READ: {
    id: 'PDC_READ',
    name: 'PDC read',
    email: BANK1_MAKER_PAYMENT_REPORT_OFFICER1.email,
  },
  PDC_RECONCILE: {
    id: 'PDC_RECONCILE',
    name: 'PDC reconcile',
    email: 'payment-officer3@ukexportfinance.gov.uk',
  },
};

module.exports = TEAMS;
