jest.mock('./src/config/database.config', () => ({
  dbName: 'dbName',
  url: 'url',
}));
