import { setupChangeStream } from './services/changeStream/setupChangeStream';

const { generateApp } = require('./generateApp');

if (process.env.CHANGE_STREAM_ENABLED === 'true') {
  setupChangeStream();
}

export const app = generateApp();
