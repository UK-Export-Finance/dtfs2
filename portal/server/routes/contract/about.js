import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
} from '../../helpers';


const router = express.Router();

router.get('/contract/:_id/about/supplier', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('about/about-supplier.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    countries: await getApiData(
      api.countries(userToken),
      res,
    ),
    industrySectors: await getApiData(
      api.industrySectors(userToken),
      res,
    ),
  });
});

router.post('/contract/:id/about/supplier', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/about/buyer`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/about/supplier/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/buyer', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('about/about-supply-buyer.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    countries: await getApiData(
      api.countries(userToken),
      res,
    ),
  });
});

router.post('/contract/:id/about/buyer', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/about/financial`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/about/buyer/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/financial', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const currencies = await getApiData(
    api.bondCurrencies(userToken),
    res,
  );

  // TODO: move to helper as used in multiple places
  const mappedCurrencies = currencies.map((c) => {
    const currency = {
      ...c,
      value: c.id,
    };
    return currency;
  });

  res.render('about/about-supply-financial.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    currencies: mappedCurrencies,
  });
});

router.post('/contract/:id/about/financial', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/about/preview`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/about/financial/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/preview', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('about/about-supply-preview.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});


export default router;
