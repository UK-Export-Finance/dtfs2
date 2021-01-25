const USERS = [
  {
    username: 'NOBODY',
    password: 'AbC!2345',
    firstname: 'Seraffimo',
    surname: 'Spang',
    email: '',
    timezone: 'Europe/London',
    roles: [],
  },
  {
    username: 'ADMIN',
    password: 'AbC!2345',
    firstname: 'Julius',
    surname: 'No',
    email: '',
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
    email: 'maker@ukexportfinance.gov.uk',
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
    email: 'maker1@ukexportfinance.gov.uk',
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
    email: 'maker1@ukexportfinance.gov.uk',
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
    email: 'maker1@ukexportfinance.gov.uk',
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
    email: 'checker@ukexportfinance.gov.uk',
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
    email: 'checker1@ukexportfinance.gov.uk',
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
    email: 'maker@ukexportfinance.gov.uk',
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
    email: 'maker2@ukexportfinance.gov.uk',
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
    email: 'maker@ukexportfinance.gov.uk',
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
    email: 'maker2@ukexportfinance.gov.uk',
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
    email: 'maker3@ukexportfinance.gov.uk',
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
    email: 'checker2@ukexportfinance.gov.uk',
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
    email: 'maker@ukexportfinance.gov.uk',
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
    email: 'maker@ukexportfinance.gov.uk',
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
    username: 'MAKER-TFM',
    password: 'AbC!2345',
    firstname: 'Tamil',
    surname: 'Rahani',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'checker@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'CHECKER-TFM',
    password: 'AbC!2345',
    firstname: 'Nikolaevich',
    surname: 'Chernov',
    email: 'checker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'checker@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'MAKENCHECK-TFM',
    password: 'AbC!2345',
    firstname: 'Vladimir',
    surname: 'Scorpius',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'checker@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'READER-TFM',
    password: 'AbC!2345',
    firstname: 'Wolfgang',
    surname: 'Weisen',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['reader'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'checker@ukexportfinance.gov.uk',
      ],
    },
  },
  {
    username: 'UKEF_OPERATIONS',
    password: 'AbC!2345',
    firstname: 'Elliot',
    surname: 'Carver',
    email: '',
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
    email: '',
    timezone: 'Europe/London',
    roles: ['editor'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '*',
    },
  },
  {
    username: 'TEST_EMAIL_NO_GOV_NOTIFY',
    password: 'AbC!2345',
    firstname: 'Wolfgang',
    surname: 'Weisen',
    email: 'test_no_notify@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      id: '*',
    },
  },
];

module.exports = USERS;
