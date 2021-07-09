import express from 'express';
import applicationPreview from '../controllers/application-preview';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/preview', validateToken, (req, res) => applicationPreview(req, res));

export default router;
