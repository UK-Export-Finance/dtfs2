import request from 'supertest';
import express from 'express';
import { HttpStatusCode } from 'axios';
import { setCacheControl } from './set-cache-control';

const app = express();
app.use(setCacheControl);
app.get('/', (_req, res) => res.send());

afterEach(() => {
  jest.resetAllMocks();
});

describe('set-no-store-cache-control', () => {
  it('should set Cache-Control headers correctly', async () => {
    const response = await request(app).get('/');

    expect(response.headers['cache-control']).toBe('no-cache, no-store, must-revalidate, max-age=0');
    expect(response.status).toBe(HttpStatusCode.Ok);
  });
});
