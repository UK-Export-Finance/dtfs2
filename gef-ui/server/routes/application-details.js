import express from 'express';
import { applicationDetails, getApplicationSubmission, postApplicationSubmission } from '../controllers/application-details';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId', validateToken, (req, res) => applicationDetails(req, res));
router.get('/application-details/:applicationId/submit', validateToken, getApplicationSubmission);
router.post('/application-details/:applicationId/submit', validateToken, postApplicationSubmission);
export default router;
