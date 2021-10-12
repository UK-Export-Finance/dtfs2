const express = require('express');
const stream = require('stream');
const api = require('../api');
const {
  getApiData,
  requestParams,
} = require('../helpers');
const validateToken = require('./middleware/validate-token');

const router = express.Router();

router.use('/mga/*', validateToken);

router.get('/mga', async (req, res) => {
  const { userToken } = requestParams(req);

  const mgaList = await getApiData(
    api.mga(userToken),
    res,
  );

  return res.render('mga.njk', { user: req.session.user, mgaList });
});

router.get('/mga/:filename', async (req, res) => {
  const { userToken } = requestParams(req);
  const { filename } = req.params;

  const fileData = await api.downloadMga(filename, userToken).catch(() => res.redirect('/not-found'));
  if (!fileData) {
    return;
  }

  res.set('Content-disposition', `attachment; filename=${filename}`);

  const readStream = new stream.PassThrough();
  fileData.pipe(readStream).pipe(res);
});

module.exports = router;
