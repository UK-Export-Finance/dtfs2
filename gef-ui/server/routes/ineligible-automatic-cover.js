import express from 'express';
import ineligibleAutomaticCover from '../controllers/ineligible-automatic-cover';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/ineligible-automatic-cover', validateToken, (req, res) => ineligibleAutomaticCover(req, res));

export default router;
