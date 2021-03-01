import express from 'express';
import {
  automaticCover,
  // validateMandatoryCriteria,
} from '../controllers/automatic-cover';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/automatic-cover', validateToken, (req, res) => automaticCover(req, res));
// router.post('/mandatory-criteria', validateToken, (req, res) => validateMandatoryCriteria(req, res));

export default router;
