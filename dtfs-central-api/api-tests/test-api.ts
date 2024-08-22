import request, { Response } from 'supertest';
import dotenv from 'dotenv';
import { Express } from 'express';
import { createApp } from '../src/createApp';

dotenv.config();

const { DTFS_CENTRAL_API_KEY } = process.env;

const headers = {
  'x-api-key': DTFS_CENTRAL_API_KEY,
  'content-type': 'application/json',
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

  private assertIsInitialised() {
    if (!this.app) {
      throw new Error('TestApi has not been initialised yet');
    }
  }

  public post(data: object) {
    this.assertIsInitialised();
    const to = async (url: string): Promise<Response> => await request(this.app).post(url).send(data).set(headers);
    return { to };
  }

  public put(data: object) {
    this.assertIsInitialised();
    const to = async (url: string): Promise<Response> => await request(this.app).put(url).send(data).set(headers);
    return { to };
  }

  public async get(url: string, data?: object): Promise<Response> {
    this.assertIsInitialised();
    return await request(this.app).get(url).send(data).set(headers);
  }

  public remove(data: object) {
    this.assertIsInitialised();
    const to = async (url: string): Promise<Response> => await request(this.app).delete(url).send(data).set(headers);
    return { to };
  }

  public patch(data: object) {
    this.assertIsInitialised();
    const to = async (url: string): Promise<Response> => await request(this.app).patch(url).send(data).set(headers);
    return { to };
  }
}

export const testApi = new TestApi();
