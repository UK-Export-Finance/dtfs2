import express from 'express';
import {
  aboutFacility,
  validateAboutFacility,
} from '../controllers/about-facility';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/facilities/:facilityId/about-facility', validateToken, (req, res) => aboutFacility(req, res));
router.post('/application-details/:applicationId/facilities/:facilityId/about-facility', validateToken, (req, res) => validateAboutFacility(req, res));

export default router;
