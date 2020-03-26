import express from 'express';
import api from '../../api';

const router = express.Router();

router.get('/contract/:id/eligibility/criteria', async (req, res) => res.render('eligibility/eligibility-criteria.njk', await api.contract(req.params.id, req.session.userToken)));

router.get('/contract/:id/eligibility/supporting-documentation', async (req, res) => res.render('eligibility/eligibility-supporting-documentation.njk', await api.contract(req.params.id, req.session.userToken)));

router.get('/contract/:id/eligibility/preview', async (req, res) => res.render('eligibility/eligibility-preview.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  mandatoryCriteria: await api.mandatoryCriteria(req.session.userToken),
}));

export default router;
