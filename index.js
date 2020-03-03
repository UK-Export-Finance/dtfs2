const express = require('express')
const nunjucks = require('nunjucks')
const api = require('./api');

const app = express()

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 5000

app.use(express.static('static'))

nunjucks.configure('templates', {
  autoescape: true,
  express: app,
  noCache: true,
  watch: true
});

// const getMockContractById = id =>
//   MOCKS.CONTRACTS.find(c => c.id === id) || MOCKS.CONTRACTS[0];
//
app.get('/', (req, res) => res.render('login.njk'))

app.get('/start-now', (req, res) => res.render('start-now.njk'))

app.get('/before-you-start', async (req, res) =>
  res.render('before-you-start.njk', { mandatoryCriteria: await api.mandatoryCriteria() })
)

app.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start-bank-deal.njk'))

app.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'))

app.get('/dashboard', async (req, res) =>
  res.render('deals.njk', {
    contracts: await api.contracts(),
    banks: await api.banks()
  })
)

app.get('/dashboard/transactions', async (req, res) =>
  res.render('transactions.njk', {
    transactions: await api.transactions(),
    banks: await api.banks()
  })
)

app.get('/contract/:id', async (req, res) =>
  res.render('contract-view.njk', await api.contract(req.params.id))
)

app.get('/contract/:id/comments', async (req, res) =>
  res.render('contract-view-comments.njk', await api.contract(req.params.id))
)

app.get('/contract/:id/submission-details', async (req, res) =>
  res.render('contract-submission-details.njk', {
    contract: await api.contract(req.params.id),
    mandatoryCriteria: await api.mandatoryCriteria()
  })
)

app.get('/contract/:id/delete', async (req, res) =>
  res.render('contract-delete.njk', await api.contract(req.params.id))
)

app.get('/contract/:id/eligibility/criteria', async (req, res) =>
  res.render('confirm-eligibility-criteria.njk', await api.contract(req.params.id))
)

app.get('/contract/:id/eligibility/supporting-documentation', async (req, res) =>
  res.render('confirm-eligibility-supporting-documentation.njk', await api.contract(req.params.id))
)

app.get('/contract/:id/eligibility/preview', async (req, res) =>
  res.render('confirm-eligibility-preview.njk', {
    contract: await api.contract(req.params.id),
    mandatoryCriteria: await api.mandatoryCriteria()
  })
)

app.get('/feedback', (req, res) => res.render('feedback.njk'))

app.get('/contact-us', (req, res) => res.render('contact.njk'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
