// index.js

/**
 * Required External Modules
 */

const express = require ("express");
const nunjucks = require('nunjucks')
const path = require("path");
/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || "8000";
/**
 *  App Configuration
 */

nunjucks.configure('views', {
  autoescape: true,
  express: app
});
/**
 * Routes Definitions
 */

app.get("/", (req, res) => {
  res.status(200).send("Hallo hallo");
});

app.get("/case", (req, res) => {
    return res.render('case/index.njk', {
    test:"test",
    primaryNav: 'reports'
  });
});

/**
 * Server Activation
 */
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});