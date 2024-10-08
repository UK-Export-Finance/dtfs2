import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

export const healthcheck = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';

healthcheck.get('/healthcheck', (req: Request, res: Response) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date(),
    commitHash: GITHUB_SHA,
  };

  return res.send(data);
});
