import express from 'express'
import path from 'path'
import nunjucks from 'nunjucks'
import routes from './routes'

const app = express()

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 5000

nunjucks.configure('templates', {
  autoescape: true,
  express: app,
  noCache: true,
  watch: true
});

app.use('/', routes);

app.use(express.static('dist'))

app.listen(PORT, () => console.log(`DTFS2 app listening on port ${PORT}!`))
