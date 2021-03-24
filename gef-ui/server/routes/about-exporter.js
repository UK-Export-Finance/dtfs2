import express from 'express';
import aboutExporter from '../controllers/about-exporter';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/about-exporter', validateToken, (req, res) => aboutExporter(req, res));

export default router;
