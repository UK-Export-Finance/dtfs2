import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

export const healthcheck = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';

/**
 * @openapi
 * /healthcheck:
 *   get:
 *     summary: Healthcheck endpoint to verify the service is running.
 *     tags: [Healthcheck]
 *     description: Returns the service status, uptime, current date, and commit hash.
 *     responses:
 *       200:
 *         description: Service is running and healthy.
 */
healthcheck.get('/healthcheck', (req: Request, res: Response) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date(),
    commitHash: GITHUB_SHA,
  };

  return res.send(data);
});
