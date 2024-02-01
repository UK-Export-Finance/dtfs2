const { MAKER, CHECKER } = require('../../../src/v1/roles/roles');

module.exports = [
  {
    username: 'nobody@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'One',
    email: 'nobody@ukexportfinance.gov.uk',
    roles: [],
  }, {
    username: 'maker1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Two',
    email: 'maker1@ukexportfinance.gov.uk',
    roles: [MAKER],
    bank: {
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  }, {
    username: 'checker1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Three',
    email: 'checker1@ukexportfinance.gov.uk',
    roles: [CHECKER],
    bank: {
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  }, {
    username: 'makerchecker@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Four',
    email: 'makerchecker@ukexportfinance.gov.uk',
    roles: [MAKER, CHECKER],
    bank: {
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  }, {
    username: 'reader1@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Five',
    email: 'reader1@ukexportfinance.gov.uk',
    roles: ['reader'],
    bank: {
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  }, {
    username: 'maker6@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Six',
    email: 'maker6@ukexportfinance.gov.uk',
    roles: [MAKER],
    bank: {
      id: '961',
      name: 'HSBC',
    },
  }, {
    username: 'checker2@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Seven',
    email: 'checker2@ukexportfinance.gov.uk',
    roles: [CHECKER],
    bank: {
      id: '961',
      name: 'HSBC',
    },
  }, {
    username: 'makerchecker2@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Eight',
    email: 'makerchecker2@ukexportfinance.gov.uk',
    roles: [MAKER, CHECKER],
    bank: {
      id: '961',
      name: 'HSBC',
    },
  }, {
    username: 'reader@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Nine',
    email: 'reader@ukexportfinance.gov.uk',
    roles: ['reader'],
    bank: {
      id: '961',
      name: 'HSBC',
    },
  },
  {
    username: 'maker@ukexportfinance.gov.uk',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Two',
    email: 'maker@ukexportfinance.gov.uk',
    roles: [MAKER],
    bank: {
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },

];
