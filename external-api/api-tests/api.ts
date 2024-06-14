import agent from 'supertest';
import dotenv from 'dotenv';
import { asString } from '@ukef/dtfs2-common';
import { Express } from 'express';

dotenv.config();

const { EXTERNAL_API_KEY } = process.env;

const headers = {
  'x-api-key': asString(EXTERNAL_API_KEY, 'EXTERNAL_API_KEY'),
};

export const api = (app: Express) => ({
  get: async (url: string) => agent(app).get(url).set(headers),
  getWithRequestBody: (data?: object) => ({
    to: async (url: string) => agent(app).get(url).send(data).set(headers),
  }),
  post: (data?: object) => ({
    to: async (url: string) => agent(app).post(url).send(data).set(headers),
  }),
});
