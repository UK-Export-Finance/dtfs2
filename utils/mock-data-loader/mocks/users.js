const USERS = [
  {
    username: 'NOBODY',
    password: 'NOBODY',
    firstname: 'Seraffimo',
    surname: 'Spang',
    timezone: 'Europe/London',
    roles: [],
  },
  {
    username: 'ADMIN',
    password: 'ADMIN',
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
    password: 'MAKER',
    firstname: 'Hugo',
    surname: 'Drax',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
    },
  },
  {
    username: 'Maker1@ukexportfinance.gov.uk',
    password: 'MAKER',
    firstname: 'Hugo',
    surname: 'Drax',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
    },
  },
  {
    username: 'BARCLAYS-MAKER-1',
    password: 'BARCLAYS-MAKER-1',
    firstname: 'Hector',
    surname: 'Gonzales',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
    },
  },
  {
    username: 'BARCLAYS-MAKER-2',
    password: 'BARCLAYS-MAKER-2',
    firstname: 'Milton',
    surname: 'Krest',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
    },
  },
  {
    username: 'CHECKER',
    password: 'CHECKER',
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
    username: 'Checker1@ukexportfinance.gov.uk',
    password: 'CHECKER',
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
    username: 'MAKENCHECK',
    password: 'MAKENCHECK',
    firstname: 'Ernst',
    surname: 'Blofeld',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
    },
  },
  {
    username: 'Maker2@ukexportfinance.gov.uk',
    password: 'MAKENCHECK',
    firstname: 'Ernst',
    surname: 'Blofeld',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
    },
  },
  {
    username: 'READER',
    password: 'READER',
    firstname: 'Francisco',
    surname: 'Scaramanga',
    timezone: 'Europe/London',
    roles: ['reader'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank',
    },
  },
  {
    username: 'MAKER-2',
    password: 'MAKER-2',
    firstname: 'Dexter',
    surname: 'Smith',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC',
    },
  },
  {
    username: 'MAKER-3',
    password: 'MAKER-3',
    firstname: 'Tamil',
    surname: 'Rahani',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC',
    },
  },
  {
    username: 'CHECKER-2',
    password: 'CHECKER-2',
    firstname: 'Nikolaevich',
    surname: 'Chernov',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC',
    },
  },
  {
    username: 'MAKENCHECK-2',
    password: 'MAKENCHECK-2',
    firstname: 'Vladimir',
    surname: 'Scorpius',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC',
    },
  },
  {
    username: 'READER-2',
    password: 'READER-2',
    firstname: 'Wolfgang',
    surname: 'Weisen',
    timezone: 'Europe/London',
    roles: ['reader'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC',
    },
  },
  {
    username: 'UKEF_OPERATIONS',
    password: 'UKEF_OPERATIONS',
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
    password: 'EDITOR',
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
