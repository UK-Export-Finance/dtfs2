import express from 'express';
import {
  facilityCurrency,
  updateFacilityCurrency,
} from '../controllers/facility-currency';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/facilities/:facilityId/facility-currency', validateToken, (req, res) => facilityCurrency(req, res));
router.post('/application-details/:applicationId/facilities/:facilityId/facility-currency', validateToken, (req, res) => updateFacilityCurrency(req, res));

export default router;
