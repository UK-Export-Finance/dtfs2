import express from 'express';
import {
  selectExportersCorrespondenceAddress,
  validateSelectExportersCorrespondenceAddress,
} from '../controllers/select-exporters-correspondence-address';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/select-exporters-correspondence-address', validateToken, (req, res) => selectExportersCorrespondenceAddress(req, res));
router.post('/application-details/:applicationId/select-exporters-correspondence-address', validateToken, (req, res) => validateSelectExportersCorrespondenceAddress(req, res));

export default router;
