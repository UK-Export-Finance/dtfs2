import request, { Response } from 'supertest';
import dotenv from 'dotenv';
import { Express } from 'express';
import { createApp } from '../server/createApp';

dotenv.config({ quiet: true });

const { DTFS_CENTRAL_API_KEY } = process.env;

const headers = {
  'x-api-key': DTFS_CENTRAL_API_KEY,
  'content-type': 'application/json',
  accept: 'application/json',
};

class TestApi {
  private app: Express | null;

  public constructor() {
    this.app = null;
  }

  public async initialise(): Promise<void> {
    if (this.app) {
      return;
    }
    this.app = await createApp();
  }

  public async reset(): Promise<void> {
    this.app = null;
    await this.initialise();
  }

  private getApp(): Express {
    if (!this.app) {
      throw new Error('TestApi has not been initialised yet');
    }

    return this.app;
  }

  public post(data: object) {
    const app = this.getApp();
    const to = async (url: string): Promise<Response> => await request(app).post(url).send(data).set(headers);
    return { to };
  }

  public put(data: object) {
    const app = this.getApp();
    const to = async (url: string): Promise<Response> => await request(app).put(url).send(data).set(headers);
    return { to };
  }

  public async get(url: string, data?: object): Promise<Response> {
    return await request(this.getApp()).get(url).send(data).set(headers);
  }

  public remove(data: object) {
    const app = this.getApp();
    const to = async (url: string): Promise<Response> => await request(app).delete(url).send(data).set(headers);
    return { to };
  }

  public patch(data: object) {
    const app = this.getApp();
    const to = async (url: string): Promise<Response> => await request(app).patch(url).send(data).set(headers);
    return { to };
  }
}

export const testApi = new TestApi();
