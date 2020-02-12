const express = require('express')
const nunjucks = require('nunjucks')
const app = express()

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 5000

nunjucks.configure('views', {
  autoescape: true,
  express: app,
  noCache: true,
  watch: true
});

app.get('/', (req, res) => res.redirect('/home.html'))
app.get('/start-now', (req, res) => res.render('start-now.njk'))

app.use(express.static('static'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
