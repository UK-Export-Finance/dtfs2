import express from 'express';
import {
  facilityGuarantee,
  updateFacilityGuarantee,
} from '../controllers/facility-guarantee';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/facilities/:facilityId/facility-guarantee', validateToken, (req, res) => facilityGuarantee(req, res));
router.post('/application-details/:applicationId/facilities/:facilityId/facility-guarantee', validateToken, (req, res) => updateFacilityGuarantee(req, res));

export default router;
