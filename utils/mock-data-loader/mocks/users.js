const USERS = [
  {
    username: 'NOBODY',
    password: 'NOBODY',
    roles: [],
  },
  {
    username: 'MAKER',
    password: 'MAKER',
    roles: ['maker'],
  },
  {
    username: 'CHECKER',
    password: 'CHECKER',
    roles: ['checker'],
  },
  {
    username: 'MAKENCHECK',
    password: 'MAKENCHECK',
    roles: ['maker', 'checker'],
  }
];

module.exports = USERS;
