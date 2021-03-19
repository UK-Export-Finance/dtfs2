import express from 'express';
import {
  enterExportersCorrespondenceAddress,
  validateEnterExportersCorrespondenceAddress,
} from '../controllers/enter-exporters-correspondence-address';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/enter-exporters-correspondence-address', validateToken, (req, res) => enterExportersCorrespondenceAddress(req, res));
router.post('/application-details/:applicationId/enter-exporters-correspondence-address', validateToken, (req, res) => validateEnterExportersCorrespondenceAddress(req, res));

export default router;
