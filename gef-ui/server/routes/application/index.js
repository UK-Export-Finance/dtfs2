import express from 'express';

import {
  getFlashSuccessMessage,
} from '../../helpers';
import {
  provide, APPLICATION,
} from '../api-data-provider';

import validateToken from '../middleware/validate-token';

const router = express.Router();

router.use('/application/*', validateToken);

router.get('/application/:_id', provide([APPLICATION]), async (req, res) => {
  const { application } = req.apiData;
  const { user } = req.session;

  return res.render('application/application-view.njk', {
    successMessage: getFlashSuccessMessage(req),
    application,
    user,
  });
});

export default router;
