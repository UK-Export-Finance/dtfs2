import express from 'express';
import api from '../../api';

const router = express.Router();

router.get('/contract/:id/bond/:bondId/details', async (req, res) => res.render('bond/bond-details.njk',
  await api.contractBond(req.params.id, req.params.bondId, req.session.userToken)));

router.post('/contract/:id/bond/:bondId/details', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/bond/${req.params.bondId}/details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/bond/:bondId/details/save-go-back', (req, res) => {
  // TODO: check if the 'go back' action takes you back to this page (currently staging is down so can't check)
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:id/bond/:bondId/financial-details', async (req, res) => res.render('bond/bond-financial-details.njk', {
  ...await api.contractBond(req.params.id, req.params.bondId, req.session.userToken),
  currencies: await api.bondCurrencies(req.session.userToken),
}));

router.post('/contract/:id/bond/:bondId/financial-details', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/bond/${req.params.bondId}/financial-details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/bond/:bondId/financial-details/save-go-back', (req, res) => {
  // TODO: check if the 'go back' action takes you back to this page (currently staging is down so can't check)
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:id/bond/:bondId/fee-details', async (req, res) => res.render('bond/bond-fee-details.njk',
  await api.contractBond(req.params.id, req.params.bondId, req.session.userToken)));

router.post('/contract/:id/bond/:bondId/fee-details', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/bond/${req.params.bondId}/fee-details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/bond/:bondId/fee-details/save-go-back', (req, res) => {
  // TODO: check if the 'go back' action takes you back to this page (currently staging is down so can't check)
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:id/bond/:bondId/preview', async (req, res) => res.render('bond/bond-preview.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  bond: api.contractBond(req.params.id, req.params.bondId, req.session.userToken),
}));

router.get('/contract/:id/bond/:bondId/delete', async (req, res) => res.render('bond/bond-delete.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  bond: api.contractBond(req.params.id, req.params.bondId, req.session.userToken),
}));

export default router;
