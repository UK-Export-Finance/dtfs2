const express = require('express')
const nunjucks = require('nunjucks')
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

app.get('/', (req, res) => res.redirect('/home'))

app.get('/home', (req, res) => res.render('home.njk'))

app.get('/start-now', (req, res) => res.render('start-now.njk'))

app.get('/before-you-start', (req, res) => res.render('before-you-start.njk'))

app.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start-bank-deal.njk'))

app.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'))

app.get('/contract/:id/comments', (req, res) =>
  res.render('contract-view-comments.njk', {
    supplyContractName: 'UKEF plc',
    id: '1234',
    details: {
      bankSupplyContractID: 'MIA/Msstar/BSS/DGR',
      ukefDealId: '20010739',
      status: 'Acknowledged by UKEF',
      previousStatus: 'Submitted',
      maker: 'MAKER DURGA',
      checker: 'CHECKER DURGA',
      submissionDate: '12/02/2020',
      dateOfLastAction: '12/02/2020 - 13:45',
      submissionType: 'Automatic Inclusion Notice'
    },
    comments: [
      {
        firstName: 'Durga',
        lastName: 'Rao',
        created: '12/02/2020 - 13:00',
        body: 'Test comment'
      },
      {
        firstName: 'Joe',
        lastName: 'Bloggs',
        created: '12/03/2020 - 10:00',
        body: '<a href="https://staging.ukexportfinance.gov.uk">https://staging.ukexportfinance.gov.uk</a>'
      }
    ]
  })
)

app.get('/feedback', (req, res) => res.render('feedback.njk'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
