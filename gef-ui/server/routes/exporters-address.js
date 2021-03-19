import express from 'express';
import {
  exportersAddress,
  validateExportersAddress,
} from '../controllers/exporters-address';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/exporters-address', validateToken, (req, res) => exportersAddress(req, res));
router.post('/application-details/:applicationId/exporters-address', validateToken, (req, res) => validateExportersAddress(req, res));

export default router;
