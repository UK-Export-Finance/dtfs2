import { AnyObject } from '@ukef/dtfs2-common';
import request from 'supertest';
import dotenv from 'dotenv';
import { IncomingHttpHeaders } from 'http';
import { TestUser } from './types/test-user';
import { TestApi } from './types/test-api';
import { File } from './types/file';
import { MultipartForm } from './types/multipart-form';

dotenv.config();

const { TFM_API_KEY } = process.env;

/**
 * @param token - The logged in user token
 * @returns the headers
 */
const getHeaders = (token?: string): IncomingHttpHeaders => {
  const headers: IncomingHttpHeaders = {
    'content-type': 'application/json',
    'x-api-key': TFM_API_KEY,
  };
  if (token) {
    headers.Authorization = token;
  }

  return headers;
};

/**
 * @param app - The express app
 * @returns supertest request mocks
 */
export const createApi = (app: unknown): TestApi => ({
  as: (user: TestUser) => {
    const token = user?.token ? user.token : '';

    return {
      post: (data: AnyObject) => ({
        to: (url: string) => request(app).post(url).send(data).set(getHeaders(token)),
      }),

      postEach: (list: AnyObject[]) => ({
        to: async (url: string) => {
          const results = [];

          for (const data of list) {
            const result = await request(app).post(url).send(data).set(getHeaders(token));

            results.push(result);
          }

          return results;
        },
      }),

      put: (data: AnyObject) => ({
        to: (url: string) => request(app).put(url).send(data).set(getHeaders(token)),
      }),

      putMultipartForm: (data: MultipartForm, files: File[] = []) => ({
        to: async (url: string) => {
          const apiRequest = request(app).put(url).set(getHeaders(token));

          if (files.length) {
            await Promise.all(files.map((file) => apiRequest.attach(file.fieldname, file.filepath)));
          }

          await Promise.all(
            Object.entries(data).map(([fieldname, value]) => {
              return apiRequest.field(fieldname, value);
            }),
          );

          return apiRequest;
        },
      }),

      get: (url: string) => request(app).get(url).set(getHeaders(token)),

      remove: (data: AnyObject) => ({
        to: (url: string) => request(app).delete(url).send(data).set(getHeaders(token)),
      }),
    };
  },
  post: (data: AnyObject) => ({
    to: (url: string) => request(app).post(url).send(data).set(getHeaders()),
  }),
  get: async (
    url: string,
    { headers, query }: { headers: IncomingHttpHeaders | undefined; query: AnyObject | undefined } = { headers: undefined, query: undefined },
  ) => {
    const requestInProgress = request(app).get(url);
    if (headers) {
      await requestInProgress.set(headers);
    }
    if (query) {
      await requestInProgress.query(query);
    }
    return requestInProgress;
  },
  put: async (url: string, data: AnyObject, { headers }: { headers: IncomingHttpHeaders | undefined } = { headers: undefined }) => {
    const requestInProgress = request(app).put(url);
    if (headers) {
      await requestInProgress.set(headers);
    }
    return requestInProgress.send(data);
  },
  remove: async (url: string, data: AnyObject, { headers }: { headers: IncomingHttpHeaders | undefined } = { headers: undefined }) => {
    const requestInProgress = request(app).delete(url);
    if (headers) {
      await requestInProgress.set(headers);
    }
    return requestInProgress.send(data);
  },
});
