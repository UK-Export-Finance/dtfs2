module.exports = overrides => ({
  code: '1015',
  name: 'AAAA',
  classes: [
    { code: 'b', name: 'b' },
    { code: 'c', name: 'c' },
    { code: 'a', name: 'a' },
  ],
  ...overrides,
});
