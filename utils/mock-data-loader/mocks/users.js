const USERS = [
  {
    username: 'NOBODY',
    password: 'NOBODY',
    firstname: 'Seraffimo',
    surname: 'Spang',
    roles: [],
  },
  {
    username: 'ADMIN',
    password: 'ADMIN',
    firstname: 'Julius',
    surname: 'No',
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
    roles: ['ukef_operations'],
    bank: {
      // _id: '', //TODO [dw] better linking of mock data
      id: '*',
    },
  },


];

module.exports = USERS;
