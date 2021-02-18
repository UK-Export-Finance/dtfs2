import express from 'express';
import ineligible from '../controllers/ineligible';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/ineligible', validateToken, (req, res) => ineligible(req, res));

export default router;
