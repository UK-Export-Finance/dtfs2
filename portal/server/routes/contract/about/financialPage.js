import express from 'express';
import api from '../../../api';
import {
  requestParams,
  mapCurrencies,
  errorHref,
  generateErrorSummary,
  sanitizeCurrency,
} from '../../../helpers';

import {
  provide, DEAL, CURRENCIES,
} from '../../api-data-provider';

import calculateStatusOfEachPage from './navStatusCalculations';
import updateSubmissionDetails from './updateSubmissionDetails';

import formDataMatchesOriginalData from '../formDataMatchesOriginalData';

const router = express.Router();

const userCanAccessAbout = (user) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  return true;
};

router.get('/contract/:_id/about/financial', provide([CURRENCIES]), async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const { user } = req.session;
  if (!userCanAccessAbout(user)) {
    return res.redirect('/');
  }

  const { deal, currencies } = req.apiData;

  let formattedValidationErrors = {};
  if (deal.submissionDetails.hasBeenPreviewed) {
    const { validationErrors } = await api.getSubmissionDetails(_id, userToken);
    formattedValidationErrors = generateErrorSummary(
      validationErrors,
      errorHref,
    );

    deal.supplyContract = {
      completedStatus: calculateStatusOfEachPage(Object.keys(formattedValidationErrors.errorList)),
    };
  }

  return res.render('contract/about/about-supply-financial.njk', {
    deal,
    validationErrors: formattedValidationErrors,
    currencies: mapCurrencies(currencies, deal.submissionDetails.supplyContractCurrency),
    user: req.session.user,
  });
});

router.post('/contract/:_id/about/financial', provide([DEAL]), async (req, res) => {
  const { userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(req.apiData[DEAL], submissionDetails, userToken);

  const redirectUrl = `/contract/${req.params._id}/about/preview`; // eslint-disable-line no-underscore-dangle
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/financial/save-go-back', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const deal = req.apiData[DEAL];
  const submissionDetails = req.body;

  const mappedFormDataForMatchCheck = {
    ...submissionDetails,
    supplyContractValue: sanitizeCurrency(submissionDetails.supplyContractValue).sanitizedValue,
  };

  const { supplyContractCurrency } = deal.submissionDetails;

  const mappedSubmissionDetailsForMatchCheck = {
    ...deal.submissionDetails,
    supplyContractCurrency: (supplyContractCurrency && supplyContractCurrency.id) ? supplyContractCurrency.id : '',
  };

  if (!formDataMatchesOriginalData(mappedFormDataForMatchCheck, mappedSubmissionDetailsForMatchCheck)) {
    await updateSubmissionDetails(deal, submissionDetails, userToken);
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});


export default router;
