import express from 'express';
import api from '../api';

const router = express.Router();

router.get('/dashboard', async (req, res) => res.render('dashboard/deals.njk', {
  contracts: await api.contracts(req.session.userToken),
  banks: await api.banks(req.session.userToken),
}));

router.get('/dashboard/transactions', async (req, res) => res.render('dashboard/transactions.njk', {
  transactions: await api.transactions(req.session.userToken),
  banks: await api.banks(req.session.userToken),
}));

export default router;
