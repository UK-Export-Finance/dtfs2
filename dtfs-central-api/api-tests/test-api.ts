import request from 'supertest';
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
    const to = async (url: string) => await request(this.app).post(url).send(data).set(headers);
    return { to };
  }

  public put(data: object) {
    this.assertIsInitialised();
    const to = async (url: string) => await request(this.app).put(url).send(data).set(headers);
    return { to };
  }

  public async get(url: string, data?: object) {
    this.assertIsInitialised();
    return await request(this.app).get(url).send(data).set(headers);
  }

  public remove(data: object) {
    this.assertIsInitialised();
    const to = async (url: string) => await request(this.app).delete(url).send(data).set(headers);
    return { to };
  }

  public as(user?: { token?: string }) {
    this.assertIsInitialised();
    const token = user?.token || '';

    const post = (data: object) => ({
      to: async (url: string) => await request(this.app).post(url).set({ authorization: token }).send(data).set(headers),
    });

    const put = (data: object) => ({
      to: async (url: string) => await request(this.app).put(url).set({ authorization: token }).send(data).set(headers),
    });

    const get = async (url: string, query = {}) => await request(this.app).get(url).set({ authorization: token }).query(query).set(headers);

    const remove = async (url: string) => await request(this.app).delete(url).set({ authorization: token }).send().set(headers);

    return { post, put, get, remove };
  }
}

export const testApi = new TestApi();
