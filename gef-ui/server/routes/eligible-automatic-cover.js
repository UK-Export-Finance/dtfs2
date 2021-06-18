import express from 'express';
import eligibleAutomaticCover from '../controllers/eligible-automatic-cover';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/eligible-automatic-cover', validateToken, (req, res) => eligibleAutomaticCover(req, res));

export default router;
