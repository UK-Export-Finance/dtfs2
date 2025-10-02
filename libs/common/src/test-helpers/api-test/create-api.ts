import request from 'supertest';
import dotenv from 'dotenv';
import { Express } from 'express';
import { IncomingHttpHeaders } from 'http';

dotenv.config();

/**
 * Creates an API helper for testing Express applications.
 *
 * @param app - The Express application instance to test against.
 * @returns An object with helper methods for making HTTP requests:
 * - `get(url, query?, headers?)`: Sends a GET request to the specified URL with optional query parameters and headers.
 * - `post(data, headers?)`: Returns an object with a `to(url)` method to send a POST request with the given data and headers to the specified URL.
 */
export const createApi = (app: Express) => ({
  get: async (url: string, query: object = {}, headers: IncomingHttpHeaders = {}) => request(app).get(url).set(headers).query(query),

  post: (data: object, headers: IncomingHttpHeaders = {}) => ({
    to: async (url: string) => request(app).post(url).set(headers).send(data),
  }),
});
