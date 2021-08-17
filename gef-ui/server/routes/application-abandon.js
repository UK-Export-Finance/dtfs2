import express from 'express';
import {
  confirmAbandonApplication,
  abandonApplication,
} from '../controllers/application-abandon';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/abandon', validateToken, confirmAbandonApplication);
router.post('/application-details/:applicationId/abandon', validateToken, abandonApplication);

export default router;
