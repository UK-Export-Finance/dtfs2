import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

export const healthcheck = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';

export const pingMulesoft = async () => 'Not configured';

healthcheck.get('/healthcheck', (req: Request, res: Response) => {
  const mulesoft = pingMulesoft();

  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date(),
    mulesoftStatus: '',
    commitHash: '',
  };

  Promise.all([mulesoft]).then((values) => {
    try {
      [data.mulesoftStatus] = values;
      data.commitHash = GITHUB_SHA;
      res.send(data);
    } catch (e: any) {
      data.message = e;
      res.status(503).send();
    }
  });
});
