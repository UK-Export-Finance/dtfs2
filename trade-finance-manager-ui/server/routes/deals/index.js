import express from 'express';
import controller from '../../controllers/deals';

const router = express.Router();

router.get('/all', controller.getDeals);

export default router;
