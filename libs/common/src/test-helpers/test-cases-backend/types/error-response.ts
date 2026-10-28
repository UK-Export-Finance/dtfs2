import { Response } from 'supertest';
import { ApiErrorResponseBody } from '@ukef/types';

export type ErrorResponse = {
  body: ApiErrorResponseBody;
} & Response;
