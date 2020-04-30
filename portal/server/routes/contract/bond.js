import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
  errorHref,
  postToApi,
  mapCurrencies,
  generateErrorSummary,
} from '../../helpers';
import {
  handleBondDetailsValidationErrors,
  handleBondFinancialDetailsValidationErrors,
  handleBondFeeDetailsValidationErrors,
  handleBondPreviewValidationErrors,
} from './validationMapping/bond';

const router = express.Router();

router.get('/contract/:_id/bond/create', async (req, res) => {
  const { _id: dealId, userToken } = requestParams(req);

  const { _id, bondId } = await api.createBond(dealId, userToken); // eslint-disable-line no-underscore-dangle

  return res.redirect(`/contract/${_id}/bond/${bondId}/details`); // eslint-disable-line no-underscore-dangle
});

router.get('/contract/:_id/bond/:bondId/details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  const apiResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = apiResponse;

  const theValidationErrors = handleBondDetailsValidationErrors(validationErrors);

  console.log('bond details theValidationErrors \n', theValidationErrors);

  return res.render('bond/bond-details.njk', {
    dealId,
    bond,
    validationErrors: theValidationErrors,
  });
});

router.post('/contract/:_id/bond/:bondId/details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      req.body,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/financial-details`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/financial-details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  const currencies = await getApiData(
    api.bondCurrencies(userToken),
    res,
  );

  const bondResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = bondResponse;

  return res.render('bond/bond-financial-details.njk', {
    dealId,
    bond,
    validationErrors: handleBondFinancialDetailsValidationErrors(validationErrors),
    currencies: mapCurrencies(currencies, bondResponse.bond.currency),
  });
});

router.post('/contract/:_id/bond/:bondId/financial-details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      req.body,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/fee-details`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/fee-details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  const apiResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = apiResponse;

  return res.render('bond/bond-fee-details.njk', {
    dealId,
    bond,
    validationErrors: handleBondFeeDetailsValidationErrors(validationErrors),
  });
});

router.post('/contract/:_id/bond/:bondId/fee-details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      req.body,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/preview`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/preview', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  const apiResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = apiResponse;

  const formattedValidationErrors = generateErrorSummary(
    handleBondPreviewValidationErrors(validationErrors, dealId, bondId),
    errorHref,
  );

  return res.render('bond/bond-preview.njk', {
    dealId,
    bond,
    validationErrors: formattedValidationErrors,
  });
});

router.post('/contract/:_id/bond/:bondId/save-go-back', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      req.body,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${req.params._id}`; // eslint-disable-line no-underscore-dangle
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:_bondId/issue-facility', async (req, res) => {
  const { _id: dealId } = requestParams(req);

  return res.render('bond/bond-issue-facility.njk', {
    dealId,
  });
});

router.get('/contract/:_id/bond/:_bondId/confirm-requested-cover-start-date', async (req, res) => {
  const { _id: dealId } = requestParams(req);

  return res.render('_shared-pages/confirm-requested-cover-start-date.njk', {
    dealId,
  });
});

router.get('/contract/:_id/bond/:bondId/delete', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  return res.render('bond/bond-delete.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    ...await getApiData(
      api.contractBond(_id, bondId, userToken),
      res,
    ),
  });
});


export default router;
