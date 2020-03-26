import express from 'express';
import api from '../../api';

const router = express.Router();

router.get('/contract/:id/about/supplier', async (req, res) => res.render('about/about-supplier.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  countries: await api.countries(req.session.userToken),
  industrySectors: await api.industrySectors(req.session.userToken),
}));

router.post('/contract/:id/about/supplier', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/about/supplier`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/about/supplier/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:id/about/buyer', async (req, res) => res.render('about/about-supply-buyer.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  countries: await api.countries(req.session.userToken),
}));

router.post('/contract/:id/about/buyer', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/about/buyer`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/about/buyer/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:id/about/financial', async (req, res) => res.render('about/about-supply-financial.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  currencies: await api.bondCurrencies(req.session.userToken),
}));

router.post('/contract/:id/about/financial', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/about/financial`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/about/financial/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:id/about/preview', async (req, res) => res.render('about/about-supply-preview.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
}));

export default router;
