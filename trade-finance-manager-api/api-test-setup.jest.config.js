const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// TODO: replace docker check with environment variable, tech debt ticket #DTFS2-7115
if (!fs.existsSync('/.dockerenv')) {
  // The api-test does not run within the container and requires localhost domain to access DB.
  process.env.MONGODB_URI = process.env.MONGODB_URI.replace('dtfs-submissions-data', 'localhost');
}

const db = require('./src/drivers/db-client');

const mockFiles = ['./src/v1/api'];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
  validate: jest.fn(),
}));

afterAll(async () => {
  await db.close();
});
