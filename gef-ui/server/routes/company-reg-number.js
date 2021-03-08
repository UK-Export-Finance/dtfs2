import express from 'express';
import {
  companyRegNumber,
  validateCompanyRegNumber,
} from '../controllers/company-reg-number';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/company-reg-number', validateToken, (req, res) => companyRegNumber(req, res));
router.post('/application-details/:applicationId/company-reg-number', validateToken, (req, res) => validateCompanyRegNumber(req, res));

export default router;
