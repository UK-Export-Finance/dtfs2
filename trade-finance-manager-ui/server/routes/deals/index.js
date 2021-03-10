import express from 'express';
import controller from '../../controllers/deals';

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('deals/all');
});

router.get('/all', controller.getDeals);

export default router;
