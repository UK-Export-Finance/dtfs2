import express from 'express';
import api from '../api';

const router = express.Router();

router.get('/case/deal', async (req, res) => {
  const deal = await api.getDeal();

  return res.render('case/deal/deal.njk', {
    deal
  });
});


export default router;
