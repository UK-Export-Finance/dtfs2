import express from 'express';
import api from '../api';
import workflow from '../portal-workflow'
const router = express.Router();

router.get('/start-now', (req, res) => res.render('start-now.njk'));

router.get('/before-you-start', async (req, res) => res.render('before-you-start/before-you-start.njk', {
  mandatoryCriteria: await api.mandatoryCriteria(req.session.userToken),
}));

router.post('/before-you-start', async (req, res) => {
  const { criteriaMet } = req.body;

  try {
    const state = workflow(req.session.deal);
    await state.setCriteriaMet(criteriaMet, req.session.userToken);

console.log(`was: ${JSON.stringify(req.session.deal)}`)

    req.session.deal = state.updatedDeal();

console.log(`-> ${JSON.stringify(req.session.deal)}`)

    // TODO: check as boolean
    if (criteriaMet === 'true') {
      return res.redirect('/before-you-start/bank-deal');
    }
    return res.redirect('/unable-to-proceed');
  } catch (err) {
    console.log(err);
    throw err;
  }
});

router.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start/before-you-start-bank-deal.njk'));

router.post('/before-you-start/bank-deal', async (req, res) => {
  const {bankDealId, bankDealName} = req.body;

  try {
    const state = workflow(req.session.deal);
    await state.setBankDetails(bankDealId, bankDealName, req.session.userToken)

    console.log(`was: ${JSON.stringify(req.session.deal)}`)

    req.session.deal = state.updatedDeal();

    console.log(`-> ${JSON.stringify(req.session.deal)}`)

    res.redirect(`/contract/${req.session.deal._id}`);
  } catch (err) {
    console.log(err);
    throw err;
  }
});

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'));

export default router;
