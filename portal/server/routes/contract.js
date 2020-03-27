import express from 'express';
import api from '../api';

const router = express.Router();

const makeApiCall = async (query) => {
  try {
    const result = await query;
    return result;
  } catch (catchErr) {
    throw new Error(catchErr);
  }
};

const getApiData = (query, res) => new Promise((resolve) =>
  makeApiCall(query).then((data) => resolve(data))
    .catch(() => { // eslint-disable-line
      // redirect to login (currently assuming all errors are auth errors)
      return res.redirect('/');
    }));

const getDealIdAndToken = (req) => {
  const { _id, bondId } = req.params;
  const { userToken } = req.session;
  return { _id, bondId, userToken };
};

router.get('/contract/:_id', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

  return res.render('contract/contract-view.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/comments', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

  return res.render('contract/contract-view-comments.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/submission-details', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

  return res.render('contract/contract-submission-details.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    mandatoryCriteria: await getApiData(
      api.mandatoryCriteria(userToken),
      res,
    ),
  });
});

router.get('/contract/:_id/delete', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

  return res.render('contract/contract-delete.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/about/supplier', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

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

router.get('/contract/:_id/about/financial', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

  res.render('about/about-supply-financial.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    currencies: await getApiData(
      api.bondCurrencies(userToken),
      res,
    ),
  });
});

router.get('/contract/:_id/about/buyer', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

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

router.get('/contract/:_id/about/preview', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

  return res.render('about/about-supply-preview.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/eligibility/criteria', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

  return res.render('eligibility/eligibility-criteria.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/eligibility/supporting-documentation', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

  return res.render('eligibility/eligibility-supporting-documentation.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/eligibility/preview', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

  return res.render('eligibility/eligibility-preview.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    mandatoryCriteria: await getApiData(
      api.mandatoryCriteria(userToken),
      res,
    ),
  });
});

router.get('/contract/:_id/bond/:bondId/details', async (req, res) => {
  const { _id, bondId, userToken } = getDealIdAndToken(req);

  return res.render('bond/bond-details.njk',
    await getApiData(
      api.contractBond(_id, bondId, userToken),
      res,
    ));
});

router.get('/contract/:_id/bond/:bondId/financial-details', async (req, res) => {
  const { _id, bondId, userToken } = getDealIdAndToken(req);

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

router.get('/contract/:_id/bond/:bondId/fee-details', async (req, res) => {
  const { _id, bondId, userToken } = getDealIdAndToken(req);

  return res.render('bond/bond-fee-details.njk', {
    ...await getApiData(
      api.contractBond(_id, bondId, userToken),
      res,
    ),
  });
});

router.get('/contract/:_id/bond/:bondId/preview', async (req, res) => {
  const { _id, bondId, userToken } = getDealIdAndToken(req);

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
  const { _id, bondId, userToken } = getDealIdAndToken(req);

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
