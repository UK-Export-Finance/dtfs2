import express from 'express';
import {
  applicationDetails,
  postApplicationDetails,
} from '../controllers/application-details';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId', validateToken, (req, res) => applicationDetails(req, res));
router.post('/application-details/:applicationId', validateToken, postApplicationDetails);

export default router;
