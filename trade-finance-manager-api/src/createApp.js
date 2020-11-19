const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config();

const app = express();
app.use(bodyParser.json({ type: 'application/json' }));


// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req, res) => {
  res.status(200).send();
});

app.use('/', rootRouter);

module.exports = app;
