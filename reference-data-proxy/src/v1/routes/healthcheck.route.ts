import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

export const healthcheck = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';

healthcheck.get('/healthcheck', (_req: Request, res: Response) => {
  const data: any = {
    commit_hash: GITHUB_SHA,
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  };
  try {
    res.status(200).send(data);
  } catch (error) {
    data.message = error;
    res.status(503).send();
  }
});
