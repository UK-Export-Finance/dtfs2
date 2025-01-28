import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { setNoStoreCacheControl } from './set-no-store-cache-control';

const app = express();
app.use(setNoStoreCacheControl);

afterEach(() => {
  jest.resetAllMocks();
});

describe('set-no-store-cache-control', () => {
  it('should set Cache-Control headers correctly', async () => {
    const middleware = (req: Request, res: Response, next: NextFunction) => {
      setNoStoreCacheControl(req, res, next);
    };

    const next = jest.fn((_req: Request, res: Response) => res.send());

    const testApp = express();
    testApp.use(middleware);
    testApp.get('/', next);

    const response = await request(testApp).get('/');

    expect(response.headers['cache-control']).toEqual('no-cache, no-store, must-revalidate, max-age=0');
    expect(response.status).toEqual(HttpStatusCode.Ok);
    expect(next).toHaveBeenCalled();
  });
});
