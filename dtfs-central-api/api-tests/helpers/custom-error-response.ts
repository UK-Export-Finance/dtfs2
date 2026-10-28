import { Response } from 'supertest';

export type CustomErrorResponse = {
  body: { errors: { msg: string }[] };
} & Response;
