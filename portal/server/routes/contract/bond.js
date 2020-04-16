import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
  errorHref,
  postToApi,
  mapCurrencies,
} from '../../helpers';

const router = express.Router();

router.get('/contract/:_id/bond/create', async (req, res) => {
  const { _id: dealId, userToken } = requestParams(req);

  const { _id, bondId } = await api.createBond(dealId, userToken); // eslint-disable-line no-underscore-dangle

  return res.redirect(`/contract/${_id}/bond/${bondId}/details`); // eslint-disable-line no-underscore-dangle
});

// TODO: if some details have been submitted
// display validationErrors for the remaining required fields
router.get('/contract/:_id/bond/:bondId/details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  return res.render('bond/bond-details.njk', {
    ...await getApiData(
      api.contractBond(_id, bondId, userToken),
      res,
    ),
  });
});

router.post('/contract/:_id/bond/:bondId/details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.updateBond(dealId, bondId, req.body, userToken),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/financial-details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/bond/:bondId/details/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params._id}`;
  return res.redirect(redirectUrl);
});

// TODO: if some details have been submitted
// display validationErrors for the remaining required fields
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

  return res.render('bond/bond-financial-details.njk', {
    ...bondResponse,
    currencies: mapCurrencies(currencies, bondResponse.bond.currency),
  });
});

router.post('/contract/:_id/bond/:bondId/financial-details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.updateBond(dealId, bondId, req.body, userToken),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/fee-details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/bond/:bondId/financial-details/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params._id}`;
  return res.redirect(redirectUrl);
});

// TODO: if some details have been submitted
// display validationErrors for the remaining required fields
router.get('/contract/:_id/bond/:bondId/fee-details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  return res.render('bond/bond-fee-details.njk', {
    ...await getApiData(
      api.contractBond(_id, bondId, userToken),
      res,
    ),
  });
});

router.post('/contract/:_id/bond/:bondId/fee-details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.updateBond(dealId, bondId, req.body, userToken),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/preview`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/bond/:bondId/fee-details/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params._id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/preview', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  return res.render('bond/bond-preview.njk', {
    ...await getApiData(
      api.contractBond(_id, bondId, userToken),
      res,
    ),
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
