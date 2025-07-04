const { MAKER, CHECKER } = require('../../../src/v1/roles/roles');

module.exports = {
  noBankNoRole: {
    username: 'noBankNoRole@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'One',
    email: 'noBankNoRole@ukexportfinance.gov.uk',
    roles: [],
    isTrusted: false,
  },
  testBank1Maker1: {
    username: 'testBank1Maker1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Two',
    email: 'testBank1Maker1@ukexportfinance.gov.uk',
    roles: [MAKER],
    bank: {
      id: '9',
      name: 'Bank 1',
      emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
    },
    isTrusted: false,
  },
  testBank1Maker2: {
    username: 'testBank1Maker2@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Two',
    email: 'testBank1Maker2@ukexportfinance.gov.uk',
    roles: [MAKER],
    bank: {
      id: '9',
      name: 'Bank 1',
      emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
    },
    isTrusted: false,
  },
  testBank1Checker1: {
    username: 'testBank1Checker1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Three',
    email: 'testBank1Checker1@ukexportfinance.gov.uk',
    roles: [CHECKER],
    bank: {
      id: '9',
      name: 'Bank 1',
      emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
    },
    isTrusted: false,
  },
  testBank1MakerChecker1: {
    username: 'testBank1MakerChecker1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Four',
    email: 'testBank1MakerChecker1@ukexportfinance.gov.uk',
    roles: [MAKER, CHECKER],
    bank: {
      id: '9',
      name: 'Bank 1',
      emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
    },
    isTrusted: false,
  },
  testBank1Reader1: {
    username: 'testBank1Reader1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Five',
    email: 'testBank1Reader1@ukexportfinance.gov.uk',
    roles: ['reader'],
    bank: {
      id: '9',
      name: 'Bank 1',
      emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
    },
    isTrusted: false,
  },
  testBank2Maker1: {
    username: 'testBank2Maker1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Six',
    email: 'testBank2Maker1@ukexportfinance.gov.uk',
    roles: [MAKER],
    bank: {
      id: '961',
      name: 'Bank 2',
    },
    isTrusted: false,
  },
  testBank2Checker1: {
    username: 'testBank2Checker1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Seven',
    email: 'testBank2Checker1@ukexportfinance.gov.uk',
    roles: [CHECKER],
    bank: {
      id: '961',
      name: 'Bank 2',
    },
    isTrusted: false,
  },
  testBank2MakerChecker1: {
    username: 'testBank2MakerChecker1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Eight',
    email: 'testBank2MakerChecker1@ukexportfinance.gov.uk',
    roles: [MAKER, CHECKER],
    bank: {
      id: '961',
      name: 'Bank 2',
    },
    isTrusted: false,
  },
  testBank2Reader1: {
    username: 'testBank2Reader1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Nine',
    email: 'testBank2Reader1@ukexportfinance.gov.uk',
    roles: ['reader'],
    bank: {
      id: '961',
      name: 'Bank 2',
    },
    isTrusted: false,
  },
};
