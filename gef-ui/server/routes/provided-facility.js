import express from 'express';
import {
  providedFacility,
  validateProvidedFacility,
} from '../controllers/provided-facility';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/facilities/:facilityId/provided-facility', validateToken, (req, res) => providedFacility(req, res));
router.post('/application-details/:applicationId/facilities/:facilityId/provided-facility', validateToken, (req, res) => validateProvidedFacility(req, res));

export default router;
