import express from 'express';
import dotenv from 'dotenv';
import { cronJobs } from '../controllers/estore';
dotenv.config();

export const cronJob = express.Router();

cronJob.get('/cronJob', cronJobs);
