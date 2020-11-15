'use strict';

const express = require('express');
const nunjucks = require('nunjucks');
var path = require('path');
// Constants

const PORT = process.env.PORT || 5100;
const HOST = '0.0.0.0';


// App
const app = express();

app.use(express.static(__dirname + '/public'));
app.use('/assets', express.static(path.join(__dirname, '/node_modules/govuk-frontend/govuk/assets')));
app.use('/assets', express.static(path.join(__dirname, '/node_modules/@ministryofjustice/frontend/moj/assets')));

nunjucks.configure('templates', {
  autoescape: true,
  express: app
});

app.get('/', (req, res) => {
  return res.render('accordeon.njk', {
    user: 'simon'
  });
});

app.get('/case', (req, res) => {
  res.send('case');
});

app.get('/case/deal', (req, res) => {
  //reportData = {};

  return res.render('case/deal/index.njk', {
    user: 'simon'
  });
});



app.listen(PORT, () => console.log(`TFM-UI app listening on port ${PORT}!`)); // eslint-disable-line no-console

