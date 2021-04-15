import express from 'express';
import {
  facilityValue,
  updateFacilityValue,
} from '../controllers/facility-value';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/facilities/:facilityId/facility-value', validateToken, (req, res) => facilityValue(req, res));
router.post('/application-details/:applicationId/facilities/:facilityId/facility-value', validateToken, (req, res) => updateFacilityValue(req, res));

export default router;
