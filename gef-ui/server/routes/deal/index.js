import express from 'express';

import {
  getFlashSuccessMessage,
} from '../../helpers';
import {
  provide, DEAL,
} from '../api-data-provider';

import validateToken from '../middleware/validate-token';

const router = express.Router();

router.use('/deal/*', validateToken);

router.get('/deal/:_id', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;
  const { user } = req.session;

  return res.render('deal/deal-view.njk', {
    successMessage: getFlashSuccessMessage(req),
    deal,
    user,
  });
});

export default router;
