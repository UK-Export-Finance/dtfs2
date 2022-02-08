import express from 'express';
import dotenv from 'dotenv';
import { createEstore } from '../controllers/estore';
dotenv.config();

export const cronJob = express.Router();

cronJob.get('/cronJob', createEstore);
