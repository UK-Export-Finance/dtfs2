import express from 'express';
import api from '../api';

const router = express.Router();

router.get('/case/deal/:_id', async (req, res) => {
  const dealId = req.params._id;// eslint-disable-line no-underscore-dangle

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/deal/deal.njk', {
    deal,
  });
});


export default router;
