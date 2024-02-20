const crypto = require('crypto');

const BANK_1 = {
  id: '9',
  name: 'UKEF test bank (Delegated)',
  mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
  emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
  companiesHouseNo: 'UKEF0001',
  partyUrn: '00318345',
  hasGefAccessOnly: false,
};

export const getUserWithRoles = (roles) => {
  const email = `${roles.join('').toLowerCase()}@ukexportfinance.gov.uk`;
  const username = email;
  const userId = crypto.randomBytes(8).toString('hex');
  const lastLogin = Date.now().toString();
  return {
    username,
    firstname: 'First Name',
    surname: 'Surname',
    email,
    roles,
    bank: BANK_1,
    timezone: 'Europe/London',
    lastLogin,
    'user-status': 'active',
    _id: userId,
  };
};

export const getUsersWithRoles = (roles) => roles.forEach((role) => getUserWithRoles(role));

module.exports = { getUserWithRoles, getUsersWithRoles };
