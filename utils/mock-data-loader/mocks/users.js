const USERS = [
  {
    username: 'NOBODY',
    password: 'AbC!2345',
    firstname: 'Seraffimo',
    surname: 'Spang',
    timezone: 'Europe/London',
    roles: [],
  },
  {
    username: 'ADMIN',
    password: 'AbC!2345',
    firstname: 'Julius',
    surname: 'No',
    timezone: 'Europe/London',
    roles: ['maker', 'editor', 'admin'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '*',
    },
  },
  {
    username: 'MAKER',
    password: 'AbC!2345',
    firstname: 'Hugo',
    surname: 'Drax',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'maker1@ukexportfinance.gov.uk',
    password: 'AbC!2345',
    firstname: 'Hugo',
    surname: 'Drax',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'BARCLAYS-MAKER-1',
    password: 'AbC!2345',
    firstname: 'Hector',
    surname: 'Gonzales',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'BARCLAYS-MAKER-2',
    password: 'AbC!2345',
    firstname: 'Milton',
    surname: 'Krest',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'CHECKER',
    password: 'AbC!2345',
    firstname: 'Emilio',
    surname: 'Largo',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
    },
  },
  {
    username: 'checker1@ukexportfinance.gov.uk',
    password: 'AbC!2345',
    firstname: 'Emilio',
    surname: 'Largo',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'MAKENCHECK',
    password: 'AbC!2345',
    firstname: 'Ernst',
    surname: 'Blofeld',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'Maker2@ukexportfinance.gov.uk',
    password: 'AbC!2345',
    firstname: 'Ernst',
    surname: 'Blofeld',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'READER',
    password: 'AbC!2345',
    firstname: 'Francisco',
    surname: 'Scaramanga',
    timezone: 'Europe/London',
    roles: ['reader'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
      emails: [
        'maker4@ukexportfinance.gov.uk',
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'MAKER-2',
    password: 'AbC!2345',
    firstname: 'Dexter',
    surname: 'Smith',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC',
      emails: [
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'MAKER-3',
    password: 'AbC!2345',
    firstname: 'Tamil',
    surname: 'Rahani',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC',
      emails: [
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'CHECKER-2',
    password: 'AbC!2345',
    firstname: 'Nikolaevich',
    surname: 'Chernov',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC',
      emails: [
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'MAKENCHECK-2',
    password: 'AbC!2345',
    firstname: 'Vladimir',
    surname: 'Scorpius',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC',
      emails: [
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'READER-2',
    password: 'AbC!2345',
    firstname: 'Wolfgang',
    surname: 'Weisen',
    timezone: 'Europe/London',
    roles: ['reader'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC',
      emails: [
        'checker4@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'UKEF_OPERATIONS',
    password: 'AbC!2345',
    firstname: 'Elliot',
    surname: 'Carver',
    timezone: 'Europe/London',
    roles: ['ukef_operations'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '*',
    },
  },
  {
    username: 'EDITOR',
    password: 'AbC!2345',
    firstname: 'Domingo',
    surname: 'Espada',
    timezone: 'Europe/London',
    roles: ['editor'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '*',
    },
  },
];

module.exports = USERS;
