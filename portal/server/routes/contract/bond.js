import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const router = express.Router();

router.get('/contract/:_id/bond/:bondId/details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  return res.render('bond/bond-details.njk',
    await getApiData(
      api.contractBond(_id, bondId, userToken),
      res,
    ));
});

router.post('/contract/:id/bond/:bondId/details', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/bond/${req.params.bondId}/financial-details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/bond/:bondId/details/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});


router.get('/contract/:_id/bond/:bondId/financial-details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  return res.render('bond/bond-financial-details.njk', {
    ...await getApiData(
      api.contractBond(_id, bondId, userToken),
      res,
    ),
    currencies: await getApiData(
      api.bondCurrencies(userToken),
      res,
    ),
  });
});

router.post('/contract/:id/bond/:bondId/financial-details', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/bond/${req.params.bondId}/fee-details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/bond/:bondId/financial-details/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/fee-details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  return res.render('bond/bond-fee-details.njk', {
    ...await getApiData(
      api.contractBond(_id, bondId, userToken),
      res,
    ),
  });
});

router.post('/contract/:id/bond/:bondId/fee-details', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/bond/${req.params.bondId}/preview`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/bond/:bondId/fee-details/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/preview', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  return res.render('bond/bond-preview.njk', {
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
