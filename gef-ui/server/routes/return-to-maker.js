import express from 'express';
import {
  getReturnToMaker,
  postReturnToMaker,
} from '../controllers/return-to-maker';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/return-to-maker', validateToken, getReturnToMaker);
router.post('/application-details/:applicationId/return-to-maker', validateToken, postReturnToMaker);

export default router;
