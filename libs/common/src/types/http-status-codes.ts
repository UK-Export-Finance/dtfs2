import { HttpStatusCode } from 'axios';

export type HttpStatusCodes = (typeof HttpStatusCode)[keyof typeof HttpStatusCode];
