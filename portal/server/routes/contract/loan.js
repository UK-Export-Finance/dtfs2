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

router.get('/contract/:_id/loan/create', async (req, res) => {
  const { _id: dealId, userToken } = requestParams(req);

  //const { _id, loanId } = await api.createLoan(dealId, userToken); // eslint-disable-line no-underscore-dangle
  const loanId = "1";
  const _id = dealId
  return res.redirect(`/contract/${_id}/loan/${loanId}/guarantee-details`); // eslint-disable-line no-underscore-dangle
});

// TODO: if some details have been submitted
// display validationErrors for the remaining required fields
router.get('/contract/:_id/loan/:loanId/guarantee-details', async (req, res) => {
  const { _id, loanId, userToken } = requestParams(req);

  return res.render('loan/loan-guarantee-details.njk', {
    // ...await getApiData(
    //   api.contractBond(_id, loanId, userToken),
    //   res,
    // ),
  });
});

router.post('/contract/:_id/loan/:loanId/guarantee-details', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  //   await postToApi(
  //     api.updateBond(dealId, loanId, req.body, userToken),
  //     errorHref,
  //   );

  const redirectUrl = `/contract/${dealId}/loan/${loanId}/financial-details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/loan/:loanId/guarantee-details/save-go-back', (req, res) => {
  // TODO: save
  const redirectUrl = `/contract/${req.params._id}`;
  return res.redirect(redirectUrl);
});

// TODO: if some details have been submitted
// display validationErrors for the remaining required fields
router.get('/contract/:_id/loan/:loanId/financial-details', async (req, res) => {
  const { _id, loanId, userToken } = requestParams(req);

  //   // const currencies = await getApiData(
  //   //   api.loanCurrencies(userToken),
  //   //   res,
  //   // );

  return res.render('loan/loan-financial-details.njk', {
    // ...await getApiData(
    //   api.contractBond(_id, loanId, userToken),
    //   res,
    // ),
    // currencies: mapCurrencies(currencies),
  });
});

router.post('/contract/:_id/loan/:loanId/financial-details', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  // await postToApi(
  //   api.updateBond(dealId, loanId, req.body, userToken),
  //   errorHref,
  // );

  const redirectUrl = `/contract/${dealId}/loan/${loanId}/dates-repayments`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/loan/:loanId/financial-details/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params._id}`;
  return res.redirect(redirectUrl);
});

// TODO: if some details have been submitted
// display validationErrors for the remaining required fields
router.get('/contract/:_id/loan/:loanId/dates-repayments', async (req, res) => {
  const { _id, loanId, userToken } = requestParams(req);

  return res.render('loan/loan-dates-repayments.njk', {
    // ...await getApiData(
    //   api.contractBond(_id, loanId, userToken),
    //   res,
    // ),
  });
});

router.post('/contract/:_id/loan/:loanId/dates-repayments', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  // await postToApi(
  //   api.updateBond(dealId, loanId, req.body, userToken),
  //   errorHref,
  // );

  const redirectUrl = `/contract/${dealId}/loan/${loanId}/preview`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/loan/:loanId/fee-details/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params._id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/loan/:loanId/preview', async (req, res) => {
  const { _id, loanId, userToken } = requestParams(req);

  return res.render('loan/loan-preview.njk', {
    "_id": _id,
    "loanId": loanId,
    "loan": {
      "_id": loanId,
      "dealId": _id
    }
    // ...await getApiData(
    //   api.contractBond(_id, loanId, userToken),
    //   res,
    // ),
  });
});

router.get('/contract/:_id/loan/:loanId/delete', async (req, res) => {
  const { _id, loanId, userToken } = requestParams(req);

  return res.render('loan/loan-delete.njk', {
    // contract: await getApiData(
    //   api.contract(_id, userToken),
    //   res,
    // ),
    // ...await getApiData(
    //   api.contractBond(_id, loanId, userToken),
    //   res,
    // ),
  });
});


export default router;
