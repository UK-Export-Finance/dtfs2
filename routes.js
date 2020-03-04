import express from 'express'
import MOCKS from './mocks'

const router = express.Router()

const getMockContractById = id =>
  MOCKS.CONTRACTS.find(c => c.id === id) || MOCKS.CONTRACTS[0];

const getContractBondById = (contract, bondId) => 
  contract.bondTransactions.items.find(bond => bond.id === bondId) || contract.bondTransactions.items[0];

router.get('/', (req, res) => res.redirect('/login'))

router.get('/login', (req, res) => res.render('login.njk'))

router.get('/start-now', (req, res) => res.render('start-now.njk'))

router.get('/before-you-start', (req, res) =>
  res.render('before-you-start.njk', { mandatoryCriteria: MOCKS.MANDATORY_CRITERIA })
)

router.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start-bank-deal.njk'))

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'))

router.get('/dashboard', (req, res) =>
  res.render('deals.njk', {
    contracts: MOCKS.CONTRACTS,
    banks: MOCKS.BANKS
  })
)

router.get('/dashboard/transactions', (req, res) =>
  res.render('transactions.njk', {
    transactions: MOCKS.TRANSACTIONS,
    banks: MOCKS.BANKS
  })
)

router.get('/contract/:id', (req, res) =>
  res.render('contract-view.njk', getMockContractById(req.params.id))
)

router.get('/contract/:id/comments', (req, res) => 
  res.render('contract-view-comments.njk', getMockContractById(req.params.id))
)

router.get('/contract/:id/submission-details', (req, res) => 
  res.render('contract-submission-details.njk', {
    contract: getMockContractById(req.params.id),
    mandatoryCriteria: MOCKS.MANDATORY_CRITERIA
  })
)

router.get('/contract/:id/delete', (req, res) =>
  res.render('contract-delete.njk', getMockContractById(req.params.id))
)

router.get('/contract/:id/eligibility/criteria', (req, res) =>
  res.render('confirm-eligibility-criteria.njk', getMockContractById(req.params.id))
)

router.get('/contract/:id/eligibility/supporting-documentation', (req, res) =>
  res.render('confirm-eligibility-supporting-documentation.njk', getMockContractById(req.params.id))
)

router.get('/contract/:id/eligibility/preview', (req, res) =>
  res.render('confirm-eligibility-preview.njk', {
    contract: getMockContractById(req.params.id),
    mandatoryCriteria: MOCKS.MANDATORY_CRITERIA
  })
)

router.get('/contract/:id/bond/:bondId/details', (req, res) =>
  res.render('contract-bond-details.njk', {
    contractId: req.params.id,
    bond: getContractBondById(
      getMockContractById(req.params.id),
      req.params.bondId
    )
  })
)

router.get('/contract/:id/bond/:bondId/financial-details', (req, res) =>
  res.render('contract-bond-financial-details.njk', {
    contractId: req.params.id,
    bond: getContractBondById(
      getMockContractById(req.params.id),
      req.params.bondId
    )
  })
)

router.get('/feedback', (req, res) => res.render('feedback.njk'))

router.get('/contact-us', (req, res) => res.render('contact.njk'))

export default router
