import express from 'express';
import api from '../api';
import {
  getApiData,
  requestParams,
  generateErrorSummary,
  errorHref,
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

router.post('/before-you-start/bank-deal', async (req, res) => {
  const { userToken } = requestParams(req);
  const { bankDealId, bankDealName } = req.body;

  const newDeal = {
    details: {
      bankSupplyContractID: bankDealId,
      bankSupplyContractName: bankDealName,
    },
  };

  try {
    const dealResponse = await api.createDeal(newDeal, userToken);
    return res.redirect(`/contract/${dealResponse._id}`);// eslint-disable-line no-underscore-dangle
  } catch (catchErr) {
    const validationErrors = generateErrorSummary(
      catchErr.response.data.validationErrors,
      errorHref,
    );

    const {
      bankSupplyContractID,
      bankSupplyContractName,
    } = catchErr.response.data.details;

    if (validationErrors) {
      return res.render('before-you-start/before-you-start-bank-deal.njk', {
        bankSupplyContractID,
        bankSupplyContractName,
        validationErrors,
      });
    }
  }
});

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'));

export default router;
