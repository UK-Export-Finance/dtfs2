const db = require('./src/database/mongo-client');

afterAll(async () => {
  await db.close();
});
