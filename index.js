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

app.get('/feedback', (req, res) => res.render('feedback.njk'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
