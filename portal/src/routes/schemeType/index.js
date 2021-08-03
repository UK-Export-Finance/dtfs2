import express from 'express';

import validateToken from '../middleware/validate-token';
import isMaker from '../middleware/isMaker';

import { getSchemeType, postSchemeType } from '../../controllers/schemeType';

const router = express.Router();
router.use('/select-scheme/*', [validateToken, isMaker]);

router.get('/select-scheme', getSchemeType);

router.post('/select-scheme', postSchemeType);

export default router;
