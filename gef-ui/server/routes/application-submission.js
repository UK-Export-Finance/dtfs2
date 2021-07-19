import express from 'express';
import {
  getApplicationSubmission,
  postApplicationSubmission,
} from '../controllers/application-submission';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/submit', validateToken, getApplicationSubmission);
router.post('/application-details/:applicationId/submit', validateToken, postApplicationSubmission);
export default router;
