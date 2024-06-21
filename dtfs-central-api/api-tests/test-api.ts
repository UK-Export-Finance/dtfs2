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

export class TestApi {
  private static app: Express;

  private static isInitialised = false;

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  private constructor() {}

  public static async initialise(): Promise<void> {
    TestApi.app = await createApp();
    TestApi.isInitialised = true;
  }

  private static assertIsInitialised() {
    if (!TestApi.isInitialised) {
      throw new Error('TestApi has not been initialised yet');
    }
  }

  public static post(data: object) {
    TestApi.assertIsInitialised();
    const to = async (url: string) => await request(TestApi.app).post(url).send(data).set(headers);
    return { to };
  }

  public static put(data: object) {
    TestApi.assertIsInitialised();
    const to = async (url: string) => await request(TestApi.app).put(url).send(data).set(headers);
    return { to };
  }

  public static async get(url: string, data?: object) {
    TestApi.assertIsInitialised();
    return await request(TestApi.app).get(url).send(data).set(headers);
  }

  public static remove(data: object) {
    TestApi.assertIsInitialised();
    const to = async (url: string) => await request(TestApi.app).delete(url).send(data).set(headers);
    return { to };
  }

  public static as(user?: { token?: string }) {
    TestApi.assertIsInitialised();
    const token = user?.token || '';

    const post = (data: object) => ({
      to: async (url: string) => await request(TestApi.app).post(url).set({ authorization: token }).send(data).set(headers),
    });

    const put = (data: object) => ({
      to: async (url: string) => await request(TestApi.app).put(url).set({ authorization: token }).send(data).set(headers),
    });

    const get = async (url: string, query = {}) => await request(TestApi.app).get(url).set({ authorization: token }).query(query).set(headers);

    const remove = async (url: string) => await request(TestApi.app).delete(url).set({ authorization: token }).send().set(headers);

    return { post, put, get, remove };
  }
}
