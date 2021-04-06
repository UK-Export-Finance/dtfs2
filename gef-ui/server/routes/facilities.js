import express from 'express';
import {
  facilities,
  createFacility,
} from '../controllers/facilities';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/facilities', validateToken, (req, res) => facilities(req, res));
router.get('/application-details/:applicationId/facilities/:facilityId', validateToken, (req, res) => facilities(req, res));
router.post('/application-details/:applicationId/facilities', validateToken, (req, res) => createFacility(req, res));
router.post('/application-details/:applicationId/facilities/:facilityId', validateToken, (req, res) => createFacility(req, res));

export default router;
