import express from 'express';
import api from '../../api';

const router = express.Router();

router.get('/contract/:id/bond/:bondId/details', async (req, res) => res.render('bond/bond-details.njk',
  await api.contractBond(req.params.id, req.params.bondId, req.session.userToken)));

router.get('/contract/:id/bond/:bondId/financial-details', async (req, res) => res.render('bond/bond-financial-details.njk', {
  ...await api.contractBond(req.params.id, req.params.bondId, req.session.userToken),
  currencies: await api.bondCurrencies(req.session.userToken),
}));

router.get('/contract/:id/bond/:bondId/fee-details', async (req, res) => res.render('bond/bond-fee-details.njk',
  await api.contractBond(req.params.id, req.params.bondId, req.session.userToken)));

router.get('/contract/:id/bond/:bondId/preview', async (req, res) => res.render('bond/bond-preview.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  bond: api.contractBond(req.params.id, req.params.bondId, req.session.userToken),
}));

router.get('/contract/:id/bond/:bondId/delete', async (req, res) => res.render('bond/bond-delete.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  bond: api.contractBond(req.params.id, req.params.bondId, req.session.userToken),
}));

export default router;
