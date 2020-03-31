module.exports = [
  {
    username: 'NOBODY',
    password: 'NOBODY',
    roles: [],
  }, {
    username: 'MAKER',
    password: 'MAKER',
    roles: ['maker'],
    bank: {
      id: '956',
      name: 'Barclays Bank'
    },
  }, {
    username: 'CHECKER',
    password: 'CHECKER',
    roles: ['checker'],
    bank: {
      id: '956',
      name: 'Barclays Bank'
    },
  }, {
    username: 'MAKENCHECK',
    password: 'MAKENCHECK',
    roles: ['maker', 'checker'],
    bank: {
      id: '956',
      name: 'Barclays Bank'
    },
  }, {
    username: 'READER',
    password: 'READER',
    roles: ['reader'],
    bank: {
      id: '956',
      name: 'Barclays Bank'
    },
  }, {
    username: 'MAKER-2',
    password: 'MAKER-2',
    roles: ['maker'],
    bank: {
      id: '961',
      name: 'HSBC'
    },
  }, {
    username: 'CHECKER-2',
    password: 'CHECKER-2',
    roles: ['checker'],
    bank: {
      id: '961',
      name: 'HSBC'
    },
  }, {
    username: 'MAKENCHECK-2',
    password: 'MAKENCHECK-2',
    roles: ['maker', 'checker'],
    bank: {
      id: '961',
      name: 'HSBC'
    },
  }, {
    username: 'READER-2',
    password: 'READER-2',
    roles: ['reader'],
    bank: {
      id: '961',
      name: 'HSBC'
    },
  }

];
