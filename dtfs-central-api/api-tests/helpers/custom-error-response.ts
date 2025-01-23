import { Response } from 'supertest';

export interface CustomErrorResponse extends Response {
  body: { errors: { msg: string }[] };
}
