import express from 'express';
import api from '../../api';

const router = express.Router();

router.get('/contract/:id/eligibility/criteria', async (req, res) => res.render('eligibility/eligibility-criteria.njk', await api.contract(req.params.id, req.session.userToken)));

router.post('/contract/:id/eligibility/criteria', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/eligibility/criteria`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/eligibility/criteria/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:id/eligibility/supporting-documentation', async (req, res) => res.render('eligibility/eligibility-supporting-documentation.njk', await api.contract(req.params.id, req.session.userToken)));

router.post('/contract/:id/eligibility/supporting-documentation', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/eligibility/supporting-documentation`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/eligibility/supporting-documentation/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:id/eligibility/preview', async (req, res) => res.render('eligibility/eligibility-preview.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  mandatoryCriteria: await api.mandatoryCriteria(req.session.userToken),
}));

export default router;
