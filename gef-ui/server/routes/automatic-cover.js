import express from 'express';
import {
  automaticCover,
  validateAutomaticCover,
} from '../controllers/automatic-cover';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/automatic-cover', validateToken, (req, res) => automaticCover(req, res));
router.post('/automatic-cover', validateToken, (req, res) => validateAutomaticCover(req, res));

export default router;
