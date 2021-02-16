import express from 'express';
import renderNameApplication from '../controllers/name-application';

const router = express.Router();

router.get('/name-application', (req, res) => renderNameApplication(req, res));
// router.post('/name-application', (req, res) => validateMandatoryCriteria(req, res))

export default router;
