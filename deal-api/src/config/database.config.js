// Connection URL
const user = encodeURIComponent('<todo>');
const password = encodeURIComponent('<todo>');
const authMechanism = 'DEFAULT';
const dbName = '<todo>';
const dbHost = 'deal-api-data';
const dbPort = '27017';

module.exports = {
  dbName,
  url: `mongodb://${user}:${password}@${dbHost}:${dbPort}?authMechanism=${authMechanism}`,
  option: {},
};
