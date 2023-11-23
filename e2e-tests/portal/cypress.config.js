const { defineConfig } = require('cypress');
const crypto = require('node:crypto');
const db = require('../support/db-client');
const createNodeOnTaskEvents = require('./cypress/createNodeOnTaskEvents');

module.exports = defineConfig({
  apiProtocol: 'http://',
  apiHost: 'localhost',
  apiPort: '5001',
  centralApiProtocol: 'http://',
  centralApiHost: 'localhost',
  centralApiPort: '5005',
  tfmApiProtocol: 'http://',
  tfmApiHost: 'localhost',
  tfmApiPort: '5004',
  // TODO: Read value from environment variable
  apiKey: 'test',
  dbName: 'dtfs-submissions',
  dbConnectionString: 'mongodb://root:r00t@localhost:27017/?authMechanism=DEFAULT',
  pageLoadTimeout: 180000,
  numTestsKeptInMemory: 1,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://localhost',
    specPattern: 'cypress/e2e/**/*.spec.js',
    setupNodeEvents(on, config) {
      on('task', createNodeOnTaskEvents(config));
      on('after:run', async () => db.close());
      const { dbName, dbConnectionString } = config;
      const connectionOptions = { dbName, dbConnectionString };
      const usersCollectionName = 'users';

      const getUsersCollection = () => db.getCollection(usersCollectionName, connectionOptions);

      on('task', {
        async getUserFromDbByEmail(email) {
          const users = await getUsersCollection();
          return users.findOne({ email: { $eq: email } });
        },

        async overrideUserSignInTokenByUsername({ username, newSignInToken }) {
          const salt = crypto.randomBytes(64);
          const hash = crypto.pbkdf2Sync(newSignInToken, salt, 210000, 64, 'sha512');
          const saltHex = salt.toString('hex');
          const hashHex = hash.toString('hex');
          const users = await getUsersCollection();
          return users.updateOne({ username: { $eq: username } }, { $set: { signInToken: { hashHex, saltHex } } });
        },
      });
    },
  },
  experimentalCspAllowList: ['child-src', 'default-src', 'frame-src', 'form-action', 'script-src', 'script-src-elem'],
});
