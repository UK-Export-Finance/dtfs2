import express from 'express';
import api from '../api';
import {
  requestParams,
  generateErrorSummary,
  errorHref,
  postToApi,
  getFlashSuccessMessage,
} from '../helpers';

import {
  provide, MANDATORY_CRITERIA,
} from './api-data-provider';

import beforeYouStartValidation from '../validation/before-you-start';

const router = express.Router();

const userCanCreateADeal = (user) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  return true;
};

router.get('/start-now', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  } else {
    res.render('start-now.njk', {
      user: req.session.user,
      successMessage: getFlashSuccessMessage(req),
    });
  }
});

router.get('/before-you-start', provide([MANDATORY_CRITERIA]), async (req, res) => {
  const { mandatoryCriteria } = req.apiData;
  const { userToken } = requestParams(req);
  const { user } = req.session;

  if (!await api.validateToken(userToken) || !userCanCreateADeal(user)) {
    res.redirect('/');
  } else {
    res.render('before-you-start/before-you-start.njk', {
      mandatoryCriteria,
      user: req.session.user,
    });
  }
});

router.post('/before-you-start', provide([MANDATORY_CRITERIA]), async (req, res) => {
  const { mandatoryCriteria } = req.apiData;

  const validationErrors = generateErrorSummary(
    beforeYouStartValidation(req.body),
    errorHref,
  );

  if (validationErrors) {
    return res.render('before-you-start/before-you-start.njk', {
      mandatoryCriteria,
      validationErrors,
    });
  }

  if (req.body.criteriaMet === 'false') {
    return res.redirect('/unable-to-proceed');
  }

  return res.redirect('/before-you-start/bank-deal');
});

router.get('/before-you-start/bank-deal', async (req, res) => {
  const { userToken } = requestParams(req);
  const { user } = req.session;

  if (!await api.validateToken(userToken) || !userCanCreateADeal(user)) {
    res.redirect('/');
  } else {
    res.render('before-you-start/before-you-start-bank-deal.njk', {
      user: req.session.user,
    });
  }
});

router.post('/before-you-start/bank-deal', async (req, res) => {
  const { userToken } = requestParams(req);

  const newDeal = {
    details: {
      ...req.body,
    },
  };

  const apiResponse = await postToApi(
    api.createDeal(newDeal, userToken),
    errorHref,
  );

  const {
    validationErrors,
    details,
  } = apiResponse;

  if (validationErrors) {
    const {
      bankSupplyContractID,
      bankSupplyContractName,
    } = details;

    return res.status(400).render('before-you-start/before-you-start-bank-deal.njk', {
      bankSupplyContractID,
      bankSupplyContractName,
      validationErrors,
      user: req.session.user,
    });
  }

  return res.redirect(`/contract/${apiResponse._id}`); // eslint-disable-line no-underscore-dangle
});

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk', {
  user: req.session.user,
}));

export default router;
