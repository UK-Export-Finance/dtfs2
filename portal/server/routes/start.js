import express from 'express';
import api from '../api';
import {
  getApiData,
  requestParams,
  generateErrorSummary,
  errorHref,
  postToApi,
} from '../helpers';
import beforeYouStartValidation from '../validation/before-you-start';

const router = express.Router();

router.get('/start-now', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  } else {
    res.render('start-now.njk');
  }
});

router.get('/before-you-start', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  } else {
    res.render('before-you-start/before-you-start.njk', {
      mandatoryCriteria: await getApiData(
        api.mandatoryCriteria(userToken),
        res,
      ),
    });
  }
});

router.post('/before-you-start', async (req, res) => {
  const { userToken } = requestParams(req);

  const validationErrors = generateErrorSummary(
    beforeYouStartValidation(req.body),
    errorHref,
  );

  if (validationErrors) {
    return res.render('before-you-start/before-you-start.njk', {
      mandatoryCriteria: await getApiData(
        api.mandatoryCriteria(userToken),
        res,
      ),
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

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  } else {
    res.render('before-you-start/before-you-start-bank-deal.njk');
  }
});

router.post('/before-you-start/bank-deal', (req, res) => {
  const { userToken } = requestParams(req);
  const { bankDealId, bankDealName } = req.body;

  const newDeal = {
    details: {
      bankSupplyContractID: bankDealId,
      bankSupplyContractName: bankDealName,
    },
  };

  // TODO: could use await-to-js package to have nicer try/catch handling
  postToApi(
    api.createDeal(newDeal, userToken),
  ).then((dealResponse) =>
    res.redirect(`/contract/${dealResponse._id}`)) // eslint-disable-line no-underscore-dangle
    .catch((catchErr) => {
      const validationErrors = generateErrorSummary(
        catchErr.validationErrors,
        errorHref,
      );

      const {
        bankSupplyContractID,
        bankSupplyContractName,
      } = catchErr.details;

      return res.render('before-you-start/before-you-start-bank-deal.njk', {
        bankSupplyContractID,
        bankSupplyContractName,
        validationErrors,
      });
    });
});

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'));

export default router;
