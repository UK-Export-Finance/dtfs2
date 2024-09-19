import { AnyObject } from '@ukef/dtfs2-common';
import { Response } from 'supertest';
import { IncomingHttpHeaders } from 'http';
import { TestUser } from './test-user';
import { File } from './file';
import { MultipartForm } from './multipart-form';

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
  data: MultipartForm,
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

export type TestApi = {
  as: TestAs;
  post: TestRequestWithoutHeaders;
  get: TestGetWithHeaders;
  put: TestPutWithHeaders;
};
