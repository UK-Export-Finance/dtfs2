module.exports = [
  {
    username: 'NOBODY',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'One',
    email: 'maker1@ukexportfinance.gov.uk',
    roles: [],
  }, {
    username: 'MAKER',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Two',
    email: 'maker2@ukexportfinance.gov.uk',
    roles: ['maker'],
    bank: {
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  }, {
    username: 'CHECKER',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Three',
    email: 'maker3@ukexportfinance.gov.uk',
    roles: ['checker'],
    bank: {
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  }, {
    username: 'MAKENCHECK',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Four',
    email: 'maker4@ukexportfinance.gov.uk',
    roles: ['maker', 'checker'],
    bank: {
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  }, {
    username: 'READER',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Five',
    email: 'maker5@ukexportfinance.gov.uk',
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
    username: 'MAKER-2',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Six',
    email: 'maker6@ukexportfinance.gov.uk',
    roles: ['maker'],
    bank: {
      id: '961',
      name: 'HSBC',
    },
  }, {
    username: 'CHECKER-2',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Seven',
    email: 'maker7@ukexportfinance.gov.uk',
    roles: ['checker'],
    bank: {
      id: '961',
      name: 'HSBC',
    },
  }, {
    username: 'MAKENCHECK-2',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Eight',
    email: 'maker8@ukexportfinance.gov.uk',
    roles: ['maker', 'checker'],
    bank: {
      id: '961',
      name: 'HSBC',
    },
  }, {
    username: 'READER-2',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Nine',
    email: 'maker9@ukexportfinance.gov.uk',
    roles: ['reader'],
    bank: {
      id: '961',
      name: 'HSBC',
    },
  },
  {
    username: 'MAKER_WITH_EMAIL',
    password: '1!aB5678',
    firstname: 'Miss',
    surname: 'Two',
    email: 'maker@testemail.com',
    roles: ['maker'],
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
