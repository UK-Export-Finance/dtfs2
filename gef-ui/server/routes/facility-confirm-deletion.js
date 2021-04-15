import express from 'express';
import {
  facilityConfirmDeletion,
  deleteFacility,
} from '../controllers/facility-confirm-deletion;
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/facilities/:facilityId/facility-deletion', validateToken, (req, res) => facilityConfirmDeletion(req, res));
router.post('/application-details/:applicationId/facilities/:facilityId/facility-deletion', validateToken, (req, res) => deleteFacility(req, res));

export default router;
