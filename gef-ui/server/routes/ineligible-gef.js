import express from 'express';
import ineligibleGef from '../controllers/ineligible-gef';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/ineligible-gef', validateToken, (req, res) => ineligibleGef(req, res));

export default router;
