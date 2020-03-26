import express from 'express';
import api from '../../api';
import aboutRoutes from './about';
import bondRoutes from './bond';
import eligibilityRoutes from './eligibility';

const router = express.Router();

router.get('/contract/:id', async (req, res) => res.render('contract/contract-view.njk', await api.contract(req.params.id, req.session.userToken)));

router.get('/contract/:id/comments', async (req, res) => res.render('contract/contract-view-comments.njk', await api.contract(req.params.id, req.session.userToken)));

router.get('/contract/:id/submission-details', async (req, res) => res.render('contract/contract-submission-details.njk', {
  contract: await api.contract(req.params.id, req.session.userToken),
  mandatoryCriteria: await api.mandatoryCriteria(req.session.userToken),
}));

router.get('/contract/:id/delete', async (req, res) => res.render('contract/contract-delete.njk', await api.contract(req.params.id, req.session.userToken)));

router.use('/',
  aboutRoutes,
  bondRoutes,
  eligibilityRoutes);

export default router;
