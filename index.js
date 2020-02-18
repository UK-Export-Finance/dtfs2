const express = require('express')
const nunjucks = require('nunjucks')
const MOCKS = require('./mocks')

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

const getMockContractById = id =>
  MOCKS.CONTRACTS.find(c => c.id === id) || MOCKS.CONTRACTS[0];

app.get('/', (req, res) => res.redirect('/home'))

app.get('/home', (req, res) => res.render('home.njk'))

app.get('/start-now', (req, res) => res.render('start-now.njk'))

app.get('/before-you-start', (req, res) => res.render('before-you-start.njk'))

app.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start-bank-deal.njk'))

app.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'))

app.get('/contract/:id', (req, res) =>
  res.render('contract-view.njk', getMockContractById(req.params.id))
)

app.get('/contract/:id/comments', (req, res) => 
  res.render('contract-view-comments.njk', getMockContractById(req.params.id))
)

app.get('/feedback', (req, res) => res.render('feedback.njk'))

app.get('/contact-us', (req, res) => res.render('contact.njk'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
