import express from 'express';
import {
  exportersAddress,
  validateExportersAddress,
  // postcodeSearch,
} from '../controllers/exporters-address';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/exporters-address', validateToken, (req, res) => exportersAddress(req, res));
router.post('/application-details/:applicationId/exporters-address', validateToken, (req, res) => validateExportersAddress(req, res));
// router.post('/application-details/:applicationId/exporters-address/postcode', validateToken, (req, res) => postcodeSearch(req, res));

export default router;
