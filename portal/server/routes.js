import express from 'express';
import api from './api';

const router = express.Router();

router.get('/.well-known/microsoft-identity-association.json',function(req,res) {
  // res.status(200)
  res.setHeader('Content-Type', 'application/json')
  //res.set({ 'Content-Type': 'application/json' });
  let jsonString = JSON.stringify({"associatedApplications": [
    {"applicationId": "131ec5af-72ab-42e9-9739-84438eea3371"}
  ]});
  let b = Buffer.from(jsonString)
  res.setHeader('Content-Length', b.length.toString())
  // Using a Buffer is how you prevent Express from adding a charset,
  // just so we can work around Azure.
  // 
  //res.send(b);
  //res.type('json').send(b)
  res.write(b)
  res.end()
}); 

// router.get('/.well-known/microsoft-identity-association',function(req,res) {
//   // res.status(200)
//   res.setHeader('Content-Type', 'application/json')
//   //res.set({ 'Content-Type': 'application/json' });
//   let jsonString = JSON.stringify({"associatedApplications": [
//     {"applicationId": "131ec5af-72ab-42e9-9739-84438eea3371"}
//   ]});
//   let b = Buffer.from(jsonString)
//   // Using a Buffer is how you prevent Express from adding a charset,
//   // just so we can work around Azure.
//   // 
//   //res.send(b);
//   //res.type('json').send(b)
//   res.write(b)
//   res.end()
// });

router.get('/', (req, res) => res.render('login.njk'));

router.get('/start-now', (req, res) => res.render('start-now.njk'));

router.get('/before-you-start', async (req, res) => res.render('before-you-start/before-you-start.njk', { mandatoryCriteria: await api.mandatoryCriteria() }));

router.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start/before-you-start-bank-deal.njk'));

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'));

router.get('/dashboard', async (req, res) => res.render('dashboard/deals.njk', {
  contracts: await api.contracts(),
  banks: await api.banks(),
}));

router.get('/dashboard/transactions', async (req, res) => res.render('dashboard/transactions.njk', {
  transactions: await api.transactions(),
  banks: await api.banks(),
}));

router.get('/contract/:id', async (req, res) => res.render('contract/contract-view.njk', await api.contract(req.params.id)));

router.get('/contract/:id/comments', async (req, res) => res.render('contract/contract-view-comments.njk', await api.contract(req.params.id)));

router.get('/contract/:id/submission-details', async (req, res) => res.render('contract/contract-submission-details.njk', {
  contract: await api.contract(req.params.id),
  mandatoryCriteria: await api.mandatoryCriteria(),
}));

router.get('/contract/:id/delete', async (req, res) => res.render('contract/contract-delete.njk', await api.contract(req.params.id)));

router.get('/contract/:id/about/supplier', async (req, res) => res.render('about/about-supplier.njk', {
  contract: await api.contract(req.params.id),
  countries: await api.countries(),
  industrySectors: await api.industrySectors(),
}));

router.get('/contract/:id/about/financial', async (req, res) => res.render('about/about-supply-financial.njk', {
  contract: await api.contract(req.params.id),
  currencies: await api.bondCurrencies(),
}));

router.get('/contract/:id/about/buyer', async (req, res) => res.render('about/about-supply-buyer.njk', {
  contract: await api.contract(req.params.id),
  countries: await api.countries(),
}));

router.get('/contract/:id/about/preview', async (req, res) => res.render('about/about-supply-preview.njk', {
  contract: await api.contract(req.params.id),
}));

router.get('/contract/:id/eligibility/criteria', async (req, res) => res.render('eligibility/eligibility-criteria.njk', await api.contract(req.params.id)));

router.get('/contract/:id/eligibility/supporting-documentation', async (req, res) => res.render('eligibility/eligibility-supporting-documentation.njk', await api.contract(req.params.id)));

router.get('/contract/:id/eligibility/preview', async (req, res) => res.render('eligibility/eligibility-preview.njk', {
  contract: await api.contract(req.params.id),
  mandatoryCriteria: await api.mandatoryCriteria(),
}));

router.get('/contract/:id/bond/:bondId/details', async (req, res) => res.render('bond/bond-details.njk',
  await api.contractBond(req.params.id, req.params.bondId)));

router.get('/contract/:id/bond/:bondId/financial-details', async (req, res) => res.render('bond/bond-financial-details.njk', {
  ...await api.contractBond(req.params.id, req.params.bondId),
  currencies: await api.bondCurrencies(),
}));

router.get('/contract/:id/bond/:bondId/fee-details', async (req, res) => res.render('bond/bond-fee-details.njk',
  await api.contractBond(req.params.id, req.params.bondId)));

router.get('/contract/:id/bond/:bondId/preview', async (req, res) => res.render('bond/bond-preview.njk', {
  contract: await api.contract(req.params.id),
  bond: api.contractBond(req.params.id, req.params.bondId),
}));

router.get('/contract/:id/bond/:bondId/delete', async (req, res) => res.render('bond/bond-delete.njk', {
  contract: await api.contract(req.params.id),
  bond: api.contractBond(req.params.id, req.params.bondId),
}));

router.get('/feedback', (req, res) => res.render('feedback.njk'));

router.get('/contact-us', (req, res) => res.render('contact.njk'));

export default router;
