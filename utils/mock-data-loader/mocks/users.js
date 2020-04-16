const USERS = [
  {
    username: 'NOBODY',
    password: 'NOBODY',
    roles: [],
  },
  {
    username: 'ADMIN',
    password: 'ADMIN',
    roles: ['maker', 'editor'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '*',
    },
  },
  {
    username: 'MAKER',
    password: 'MAKER',
    roles: ['maker'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank'
    },
  },
  {
    username: 'BARCLAYS-MAKER-1',
    password: 'BARCLAYS-MAKER-1',
    roles: ['maker'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank'
    },
  },
  {
    username: 'BARCLAYS-MAKER-2',
    password: 'BARCLAYS-MAKER-2',
    roles: ['maker'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank'
    },
  },
  {
    username: 'CHECKER',
    password: 'CHECKER',
    roles: ['checker'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank'
    },
  },
  {
    username: 'MAKENCHECK',
    password: 'MAKENCHECK',
    roles: ['maker', 'checker'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank'
    },
  },
  {
    username: 'READER',
    password: 'READER',
    roles: ['reader'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '956',
      name: 'Barclays Bank'
    },
  },
  {
    username: 'MAKER-2',
    password: 'MAKER-2',
    roles: ['maker'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC'
    },
  },
  {
    username: 'MAKER-3',
    password: 'MAKER-3',
    roles: ['maker'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC'
    },
  },
  {
    username: 'CHECKER-2',
    password: 'CHECKER-2',
    roles: ['checker'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC'
    },
  },
  {
    username: 'MAKENCHECK-2',
    password: 'MAKENCHECK-2',
    roles: ['maker', 'checker'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC'
    },
  },
  {
    username: 'READER-2',
    password: 'READER-2',
    roles: ['reader'],
    bank: {
      //_id: '', //TODO [dw] better linking of mock data
      id: '961',
      name: 'HSBC'
    },
  }

];

module.exports = USERS;
