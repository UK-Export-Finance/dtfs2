import express from 'express';
import {
  companiesRegNumber,
  validateCompaniesRegNumber,
} from '../controllers/companies-reg-number';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/companies-reg-number', validateToken, (req, res) => companiesRegNumber(req, res));
router.post('/application-details/:applicationId/companies-reg-number', validateToken, (req, res) => validateCompaniesRegNumber(req, res));

export default router;
