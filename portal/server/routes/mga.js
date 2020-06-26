import express from 'express';
import stream from 'stream';
import api from '../api';
import {
  getApiData,
  requestParams,
} from '../helpers';

const router = express.Router();

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

export default router;
