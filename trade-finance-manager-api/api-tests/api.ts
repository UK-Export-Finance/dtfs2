import { AnyObject } from '@ukef/dtfs2-common';
import request, { Response } from 'supertest';
import dotenv from 'dotenv';
import { IncomingHttpHeaders } from 'http';
import { TestUser } from './types/test-user';

dotenv.config();

const { TFM_API_KEY } = process.env;

type File = {
  fieldname: string;
  filepath: string;
};

export type TestRequestWithoutHeaders = (data: AnyObject) => {
  to: (url: string) => Promise<Response>;
};

type TestGetWithHeaders = (
  url: string,
  {
    headers,
    query,
  }?: {
    headers: IncomingHttpHeaders | undefined;
    query: AnyObject | undefined;
  },
) => Promise<Response>;

type TestPutWithHeaders = (
  url: string,
  data: AnyObject,
  {
    headers,
  }?: {
    headers: IncomingHttpHeaders | undefined;
  },
) => Promise<Response>;

type TestPostEach = (list: AnyObject[]) => {
  to: (url: string) => Promise<Response[]>;
};

type TestPutMultipartForm = (
  data: AnyObject,
  files?: File[],
) => {
  to: (url: string) => Promise<Response>;
};

type TestGetWithoutHeaders = (url: string) => Promise<Response>;

export type TestAs = (user: TestUser) => {
  post: TestRequestWithoutHeaders;
  postEach: TestPostEach;
  put: TestRequestWithoutHeaders;
  putMultipartForm: TestPutMultipartForm;
  get: TestGetWithoutHeaders;
  remove: TestRequestWithoutHeaders;
};

type TestApi = {
  as: TestAs;
  post: TestRequestWithoutHeaders;
  get: TestGetWithHeaders;
  put: TestPutWithHeaders;
};

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

export const createApi = (app: unknown): TestApi => ({
  as: (user: TestUser) => {
    const token = user?.token ? user.token : '';

    return {
      post: (data: AnyObject) => ({
        to: async (url: string) => request(app).post(url).send(data).set(getHeaders(token)),
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
        to: async (url: string) => request(app).put(url).send(data).set(getHeaders(token)),
      }),

      putMultipartForm: (data: AnyObject, files: File[] = []) => ({
        to: async (url: string) => {
          const apiRequest = request(app).put(url).set(getHeaders(token));

          if (files.length) {
            await Promise.all(files.map((file) => apiRequest.attach(file.fieldname, file.filepath)));
          }

          await Promise.all(
            Object.entries(data).map(([fieldname, value]) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              return apiRequest.field(fieldname, value as any);
            }),
          );

          return apiRequest;
        },
      }),

      get: async (url: string) => request(app).get(url).set(getHeaders(token)),

      remove: (data: AnyObject) => ({
        to: async (url: string) => request(app).delete(url).send(data).set(getHeaders(token)),
      }),
    };
  },
  post: (data: AnyObject) => ({
    to: async (url: string) => request(app).post(url).send(data).set(getHeaders()),
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
});
