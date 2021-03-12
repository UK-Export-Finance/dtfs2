import express from 'express';
import {
  exportersAddress,
} from '../controllers/exporters-address';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/exporters-address', validateToken, (req, res) => exportersAddress(req, res));

export default router;
