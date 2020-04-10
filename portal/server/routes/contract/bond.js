import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
  errorHref,
  postToApi,
} from '../../helpers';

const router = express.Router();

router.get('/contract/:_id/bond/create', async (req, res) => {
  const { _id: dealId, userToken } = requestParams(req);

  const updatedDeal = await api.createBond(dealId, userToken);

  // TODO: this is assuming the _last_ bond in the array is the created one.
  // somehow get the created bond ID back from API.
  const { items: bonds } = updatedDeal.bondTransactions;
  const createdBondId = bonds[bonds.length - 1]._id; // eslint-disable-line no-underscore-dangle

  return res.redirect(`/contract/${dealId}/bond/${createdBondId}/details`); // eslint-disable-line no-underscore-dangle
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
  const { _id, bondId, userToken } = requestParams(req);

  // console.log('*** bond details POST req body \n', req.body);

  const apiResponse = await postToApi(
    api.updateBond(_id, bondId, req.body, userToken),
    errorHref,
  );

  // if (validationErrors) {
  //   return res.render('bond/bond-details.njk', {
  //     validationErrors,
  //   });
  // }

  const redirectUrl = `/contract/${req.params._id}/bond/${req.params.bondId}/financial-details`;
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
