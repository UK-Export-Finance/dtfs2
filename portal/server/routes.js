import express from 'express'
import api from './api'

const router = express.Router()

router.get('/', (req, res) => res.render('login.njk'))

router.get('/start-now', (req, res) => res.render('start-now.njk'))

router.get('/before-you-start', async (req, res) =>
  res.render('before-you-start.njk', { mandatoryCriteria: await api.mandatoryCriteria() })
)

router.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start-bank-deal.njk'))

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'))

router.get('/dashboard', async (req, res) =>
  res.render('deals.njk', {
    contracts: await api.contracts(),
    banks: await api.banks()
  })
)

router.get('/dashboard/transactions', async (req, res) =>
  res.render('transactions.njk', {
    transactions: await api.transactions(),
    banks: await api.banks()
  })
)

router.get('/contract/:id', async (req, res) =>
  res.render('contract-view.njk', await api.contract(req.params.id))
)

router.get('/contract/:id/comments', async (req, res) =>
  res.render('contract-view-comments.njk', await api.contract(req.params.id))
)

router.get('/contract/:id/submission-details', async (req, res) =>
  res.render('contract-submission-details.njk', {
    contract: await api.contract(req.params.id),
    mandatoryCriteria: await api.mandatoryCriteria()
  })
)

router.get('/contract/:id/delete', async (req, res) =>
  res.render('contract-delete.njk', await api.contract(req.params.id))
)

router.get('/contract/:id/eligibility/criteria', async (req, res) =>
  res.render('confirm-eligibility-criteria.njk', await api.contract(req.params.id))
)

router.get('/contract/:id/eligibility/supporting-documentation', async (req, res) =>
  res.render('confirm-eligibility-supporting-documentation.njk', await api.contract(req.params.id))
)

router.get('/contract/:id/eligibility/preview', async (req, res) =>
  res.render('confirm-eligibility-preview.njk', {
    contract: await api.contract(req.params.id),
    mandatoryCriteria: await api.mandatoryCriteria()
  })
)

router.get('/contract/:id/bond/:bondId/details', async (req, res) =>
  res.render('contract-bond-details.njk',
    await api.contractBond(req.params.id, req.params.bondId)
  )
)

router.get('/contract/:id/bond/:bondId/financial-details', async (req, res) =>
  res.render('contract-bond-financial-details.njk', {
    ...await api.contractBond(req.params.id, req.params.bondId),
    currencies: await api.bondCurrencies()
  })
)

router.get('/contract/:id/bond/:bondId/fee-details', async (req, res) =>
  res.render('contract-bond-fee-details.njk',
    await api.contractBond(req.params.id, req.params.bondId)
  )
)

router.get('/contract/:id/bond/:bondId/preview', async (req, res) =>
  res.render('contract-bond-preview.njk', {
      contract: await api.contract(req.params.id),
      bond: api.contractBond(req.params.id, req.params.bondId)
  })
)

router.get('/contract/:id/bond/:bondId/delete', async (req, res) =>
  res.render('contract-bond-delete.njk', {
    contract: await api.contract(req.params.id),
    bond: api.contractBond(req.params.id, req.params.bondId)
  })
)

router.get('/feedback', (req, res) => res.render('feedback.njk'))

router.get('/contact-us', (req, res) => res.render('contact.njk'))

export default router
