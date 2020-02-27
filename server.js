import express from 'express'
import path from 'path'
import nunjucks from 'nunjucks'
import MOCKS from './mocks'

const app = express()

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 5000

app.use(express.static(__dirname))

// nunjucks.configure('templates', {
//   autoescape: true,
//   express: app,
//   noCache: true,
//   watch: true
// });

const getMockContractById = id =>
  MOCKS.CONTRACTS.find(c => c.id === id) || MOCKS.CONTRACTS[0];

// app.get('/', (req, res) => res.render('login.njk'))
app.get('*', (req, res) => res.sendFile('index.html'))

app.get('/start-now', (req, res) => res.render('start-now.njk'))

app.get('/before-you-start', (req, res) =>
  res.render('before-you-start.njk', { mandatoryCriteria: MOCKS.MANDATORY_CRITERIA })
)

app.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start-bank-deal.njk'))

app.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'))

app.get('/dashboard', (req, res) =>
  res.render('deals.njk', { contracts: MOCKS.CONTRACTS }))

app.get('/dashboard/transactions', (req, res) =>
  res.render('transactions.njk', { transactions: MOCKS.TRANSACTIONS }))

app.get('/contract/:id', (req, res) =>
  res.render('contract-view.njk', getMockContractById(req.params.id))
)

app.get('/contract/:id/comments', (req, res) => 
  res.render('contract-view-comments.njk', getMockContractById(req.params.id))
)

app.get('/contract/:id/submission-details', (req, res) => 
  res.render('contract-submission-details.njk', {
    contract: getMockContractById(req.params.id),
    mandatoryCriteria: MOCKS.MANDATORY_CRITERIA
  })
)

app.get('/contract/:id/delete', (req, res) =>
  res.render('contract-delete.njk', getMockContractById(req.params.id))
)

app.get('/contract/:id/eligibility/criteria', (req, res) =>
  res.render('confirm-eligibility-criteria.njk', getMockContractById(req.params.id))
)

app.get('/contract/:id/eligibility/supporting-documentation', (req, res) =>
  res.render('confirm-eligibility-supporting-documentation.njk', getMockContractById(req.params.id))
)

app.get('/contract/:id/eligibility/preview', (req, res) =>
  res.render('confirm-eligibility-preview.njk', {
    contract: getMockContractById(req.params.id),
    mandatoryCriteria: MOCKS.MANDATORY_CRITERIA
  })
)

app.get('/feedback', (req, res) => res.render('feedback.njk'))

app.get('/contact-us', (req, res) => res.render('contact.njk'))

app.listen(PORT, () => console.log(`DTFS2 app listening on port ${PORT}!`))
