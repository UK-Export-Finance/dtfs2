import express from 'express';
import {
  companiesHouse,
  validateCompaniesHouse,
} from '../controllers/companies-house';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/companies-house', validateToken, (req, res) => companiesHouse(req, res));
router.post('/application-details/:applicationId/companies-house', validateToken, (req, res) => validateCompaniesHouse(req, res));

export default router;
