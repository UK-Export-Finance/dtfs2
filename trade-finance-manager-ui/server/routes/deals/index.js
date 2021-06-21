import express from 'express';
import controller from '../../controllers/deals';

const router = express.Router();

router.get('/', controller.getDeals);
router.post('/', controller.queryDeals);

// router.post('/sort', controller.sortDeals);

export default router;
