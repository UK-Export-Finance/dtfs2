import agent = require('supertest');
// eslint-disable-next-line import/no-import-module-exports
import dotenv from 'dotenv';

dotenv.config();

const { EXTERNAL_API_KEY } = process.env;

const headers = {
  'x-api-key': EXTERNAL_API_KEY,
};

export const api = (app: any) => ({
  get: async (url: string) => agent(app).get(url).set(headers),
  getWithRequestBody: (data?: any) => ({
    to: async (url: string) => agent(app).get(url).send(data).set(headers),
  }),
  post: (data?: any) => ({
    to: async (url: string) => agent(app).post(url).send(data).set(headers),
  }),
});
