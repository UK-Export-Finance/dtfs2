import express from 'express';
import { nameApplication, createApplication } from '../controllers/name-application';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/name-application', validateToken, (req, res) => nameApplication(req, res));
router.post('/name-application', validateToken, (req, res) => createApplication(req, res));

export default router;
