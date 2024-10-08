import { Response } from 'supertest';
import { ApiErrorResponseBody } from '../../../types';

export interface ErrorResponse extends Response {
  body: ApiErrorResponseBody;
}
